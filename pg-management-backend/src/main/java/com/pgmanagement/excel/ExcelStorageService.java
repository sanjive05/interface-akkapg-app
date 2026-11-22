package com.pgmanagement.excel;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pgmanagement.config.PgContext;
import com.pgmanagement.config.StorageProperties;
import com.pgmanagement.exception.ExcelStorageException;
import jakarta.annotation.PostConstruct;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.file.*;
import java.sql.*;
import java.util.*;

/**
 * SQLite-backed storage adapter. The historical class name is retained so the
 * existing services/controllers do not need an API rewrite. Excel workbooks
 * are read only during one-time import; report exports continue to use POI.
 */
@Service
public class ExcelStorageService {
    private final Path dataDirectory;
    private final Path databaseFile;
    private final ExcelDefinitions definitions;
    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, ExcelWorkbookDefinition> definitionsByFile = new HashMap<>();

    public ExcelStorageService(StorageProperties properties, ExcelDefinitions definitions) {
        Path configured = properties.getDirectory();
        Path resolved = configured.toAbsolutePath().normalize();
        Path projectRootData = Path.of("pg-management-backend", "data").toAbsolutePath().normalize();
        boolean defaultRelative = !configured.isAbsolute()
                && (configured.normalize().toString().equals("data") || configured.normalize().toString().equals("./data"));
        if (defaultRelative && Files.exists(projectRootData.resolve("akka-pg").resolve("tenants.xlsx"))
                && !Files.exists(resolved.resolve("akka-pg").resolve("tenants.xlsx"))) {
            resolved = projectRootData;
        }
        this.dataDirectory = resolved;
        this.databaseFile = dataDirectory.resolve("pg-management.db");
        this.definitions = definitions;
        definitions.all().forEach(d -> definitionsByFile.put(d.fileName(), d));
    }

    @PostConstruct
    public void initialize() {
        try {
            Files.createDirectories(dataDirectory);
            Class.forName("org.sqlite.JDBC");
            try (Connection c = connection(); Statement s = c.createStatement()) {
                s.execute("CREATE TABLE IF NOT EXISTS pg_records (workspace TEXT NOT NULL, collection TEXT NOT NULL, record_id TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(workspace, collection, record_id))");
                s.execute("CREATE INDEX IF NOT EXISTS idx_pg_records_collection ON pg_records(workspace, collection)");
                s.execute("PRAGMA journal_mode=WAL");
            }
            importLegacyWorkbooksOnce();
            System.out.println("[PG STORAGE] SQLite database: " + databaseFile);
        } catch (Exception e) {
            throw new ExcelStorageException("Unable to initialize SQLite storage at " + databaseFile, e);
        }
    }

    private Connection connection() throws SQLException {
        Connection c = DriverManager.getConnection("jdbc:sqlite:" + databaseFile);
        try (Statement s = c.createStatement()) {
            s.execute("PRAGMA busy_timeout=10000");
            s.execute("PRAGMA foreign_keys=ON");
        }
        return c;
    }

    private void importLegacyWorkbooksOnce() throws Exception {
        for (String workspace : List.of("AKKA-PG", "SUBASH-PG")) {
            Path folder = dataDirectory.resolve(workspace.toLowerCase(Locale.ROOT));
            for (ExcelWorkbookDefinition def : definitions.all()) {
                if ("users.xlsx".equals(def.fileName())) continue;
                if (count(workspace, def.fileName()) > 0) continue;
                Path xlsx = folder.resolve(def.fileName());
                if (!Files.exists(xlsx)) continue;
                List<Map<String,String>> rows = readWorkbook(xlsx, def);
                if (!rows.isEmpty()) {
                    try (Connection c = connection()) {
                        c.setAutoCommit(false);
                        try {
                            for (Map<String,String> row : rows) put(c, workspace, def, row);
                            c.commit();
                        } catch (Exception ex) { c.rollback(); throw ex; }
                    }
                    System.out.printf("[PG STORAGE] Imported %d records from %s/%s%n", rows.size(), workspace, def.fileName());
                }
            }
        }
    }

    private List<Map<String,String>> readWorkbook(Path path, ExcelWorkbookDefinition def) throws Exception {
        List<Map<String,String>> rows = new ArrayList<>();
        try (InputStream in = Files.newInputStream(path); Workbook wb = WorkbookFactory.create(in)) {
            Sheet sheet = wb.getSheet(def.sheetName());
            if (sheet == null || sheet.getRow(0) == null) return rows;
            Map<String,Integer> columns = new HashMap<>();
            Row header = sheet.getRow(0);
            for (Cell cell : header) columns.put(cellToString(cell), cell.getColumnIndex());
            DataFormatter formatter = new DataFormatter();
            for (int i=1; i<=sheet.getLastRowNum(); i++) {
                Row r=sheet.getRow(i); if (r==null) continue;
                Map<String,String> row=new LinkedHashMap<>(); boolean any=false;
                for(String h:def.headers()) {
                    Integer col=columns.get(h); String value=col==null?"":formatter.formatCellValue(r.getCell(col));
                    row.put(h,value); if(!value.isBlank()) any=true;
                }
                if(any && !row.getOrDefault(def.idHeader(), "").isBlank()) rows.add(row);
            }
        }
        return rows;
    }

    private String cellToString(Cell cell) { return cell == null ? "" : new DataFormatter().formatCellValue(cell); }

    public List<Map<String, String>> readAll(String fileName) {
        ExcelWorkbookDefinition def = requireDefinition(fileName);
        String workspace = workspace(fileName);
        List<Map<String,String>> result = new ArrayList<>();
        String sql = "SELECT payload FROM pg_records WHERE workspace=? AND collection=? ORDER BY rowid";
        try (Connection c=connection(); PreparedStatement p=c.prepareStatement(sql)) {
            p.setString(1,workspace); p.setString(2,fileName);
            try(ResultSet rs=p.executeQuery()) { while(rs.next()) result.add(mapper.readValue(rs.getString(1), new TypeReference<LinkedHashMap<String,String>>(){})); }
            return result;
        } catch(Exception e) { throw new ExcelStorageException("Failed to read SQLite collection " + fileName,e); }
    }

    public Map<String, String> findById(String fileName, String id) {
        ExcelWorkbookDefinition def=requireDefinition(fileName);
        String workspace=workspace(fileName);
        try(Connection c=connection();PreparedStatement p=c.prepareStatement("SELECT payload FROM pg_records WHERE workspace=? AND collection=? AND record_id=?")) {
            p.setString(1,workspace);p.setString(2,fileName);p.setString(3,id);
            try(ResultSet rs=p.executeQuery()){return rs.next()?mapper.readValue(rs.getString(1),new TypeReference<LinkedHashMap<String,String>>(){}):null;}
        } catch(Exception e){throw new ExcelStorageException("Failed to find record in "+fileName,e);}
    }

    public void append(String fileName, Map<String, String> record) {
        ExcelWorkbookDefinition def=requireDefinition(fileName);
        String id=Objects.toString(record.get(def.idHeader()),"");
        if(id.isBlank()) throw new IllegalArgumentException("Record ID is required: "+def.idHeader());
        try(Connection c=connection()){put(c,workspace(fileName),def,record);}
        catch(Exception e){throw new ExcelStorageException("Failed to insert record into "+fileName,e);}
    }

    public void updateById(String fileName, String id, Map<String, String> updates) {
        ExcelWorkbookDefinition def=requireDefinition(fileName); String workspace=workspace(fileName);
        try(Connection c=connection()) {
            c.setAutoCommit(false);
            try {
                Map<String,String> existing=select(c,workspace,fileName,id);
                if(existing==null) throw new NoSuchElementException("No record found for ID: "+id);
                for(Map.Entry<String,String> e:updates.entrySet()) {
                    if(!def.headers().contains(e.getKey())) throw new IllegalArgumentException("Unknown column: "+e.getKey());
                    existing.put(e.getKey(),Objects.toString(e.getValue(),""));
                }
                put(c,workspace,def,existing); c.commit();
            } catch(Exception ex){c.rollback();throw ex;}
        } catch(Exception e){throw new ExcelStorageException("Failed to update "+fileName,e);}
    }

    public void deleteById(String fileName, String id) {
        requireDefinition(fileName);
        try(Connection c=connection();PreparedStatement p=c.prepareStatement("DELETE FROM pg_records WHERE workspace=? AND collection=? AND record_id=?")) {
            p.setString(1,workspace(fileName));p.setString(2,fileName);p.setString(3,id);
            if(p.executeUpdate()==0) throw new NoSuchElementException("No record found for ID: "+id);
        } catch(Exception e){throw new ExcelStorageException("Failed to delete from "+fileName,e);}
    }

    public Path getDataDirectory() { return dataDirectory; }
    public Path getDatabaseFile() { return databaseFile; }

    private void put(Connection c,String workspace,ExcelWorkbookDefinition def,Map<String,String> source) throws Exception {
        Map<String,String> row=new LinkedHashMap<>();
        for(String h:def.headers()) row.put(h,Objects.toString(source.get(h),""));
        String id=row.get(def.idHeader()); if(id==null||id.isBlank()) throw new IllegalArgumentException("Missing key "+def.idHeader());
        try(PreparedStatement p=c.prepareStatement("INSERT INTO pg_records(workspace,collection,record_id,payload) VALUES(?,?,?,?) ON CONFLICT(workspace,collection,record_id) DO UPDATE SET payload=excluded.payload")) {
            p.setString(1,workspace);p.setString(2,def.fileName());p.setString(3,id);p.setString(4,mapper.writeValueAsString(row));p.executeUpdate();
        }
    }

    private Map<String,String> select(Connection c,String workspace,String collection,String id) throws Exception {
        try(PreparedStatement p=c.prepareStatement("SELECT payload FROM pg_records WHERE workspace=? AND collection=? AND record_id=?")) {
            p.setString(1,workspace);p.setString(2,collection);p.setString(3,id);
            try(ResultSet rs=p.executeQuery()){return rs.next()?mapper.readValue(rs.getString(1),new TypeReference<LinkedHashMap<String,String>>(){}):null;}
        }
    }

    private long count(String workspace,String collection) throws SQLException {
        try(Connection c=connection();PreparedStatement p=c.prepareStatement("SELECT COUNT(*) FROM pg_records WHERE workspace=? AND collection=?")) {
            p.setString(1,workspace);p.setString(2,collection);try(ResultSet rs=p.executeQuery()){return rs.next()?rs.getLong(1):0;}
        }
    }

    private String workspace(String fileName) { return "users.xlsx".equals(fileName)?"GLOBAL":PgContext.get(); }
    private ExcelWorkbookDefinition requireDefinition(String fileName) {
        ExcelWorkbookDefinition def=definitionsByFile.get(fileName);
        if(def==null) throw new IllegalArgumentException("Unsupported collection: "+fileName);
        return def;
    }
}

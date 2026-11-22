package com.pgmanagement.service;

import com.pgmanagement.config.PgContext;
import com.pgmanagement.excel.ExcelStorageService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class ReportService {
    private final PgOperationsService operations;
    private final ExcelStorageService excel;
    public ReportService(PgOperationsService operations, ExcelStorageService excel) { this.operations=operations; this.excel=excel; }

    public byte[] monthly(String month) { return createReport(month, false); }
    public byte[] whatsapp(String month) { return createReport(month, true); }

    private byte[] createReport(String month, boolean whatsapp) {
        List<Map<String,String>> bills=operations.bills(month);
        Map<String,Map<String,String>> tenants=new HashMap<>();
        excel.readAll("tenants.xlsx").forEach(t -> tenants.put(t.get("tenantId"), t));
        try(Workbook wb=new XSSFWorkbook(); ByteArrayOutputStream out=new ByteArrayOutputStream()) {
            if (whatsapp) {
                String pgName = "SUBASH-PG".equals(PgContext.get()) ? "SUBASH PG" : "AKKA PG";
                Sheet sheet=wb.createSheet(safeSheetName(month));
                Row title=sheet.createRow(0); title.createCell(0).setCellValue(pgName + " | Monthly Rent Details | " + month);
                String[] headers={"NAME","PHONE NUMBER","RENT","FOOD","ELECTRICITY","PENDINGS","TOTAL"};
                Row header=sheet.createRow(1); CellStyle style=headerStyle(wb);
                for(int i=0;i<headers.length;i++){Cell c=header.createCell(i);c.setCellValue(headers[i]);c.setCellStyle(style);sheet.setColumnWidth(i, i==0?26*256:i==1?19*256:16*256);}
                int rowIndex=2;
                for(Map<String,String> bill:bills){
                    Map<String,String> tenant=tenants.getOrDefault(bill.get("tenantId"), Map.of());
                    Row row=sheet.createRow(rowIndex++);
                    row.createCell(0).setCellValue(bill.getOrDefault("tenantName", tenant.getOrDefault("fullName","")));
                    row.createCell(1).setCellValue(scriptPhone(tenant.getOrDefault("phoneNumber","")));
                    row.createCell(2).setCellValue(integerAmount(bill.get("monthlyRent")));
                    row.createCell(3).setCellValue(integerAmount(bill.get("foodCharges")));
                    row.createCell(4).setCellValue(integerAmount(bill.get("electricityCharges")));
                    double scriptPending = integerAmount(bill.get("previousBalance"))
                            + integerAmount(bill.get("otherCharges")) - integerAmount(bill.get("discount"));
                    row.createCell(5).setCellValue(scriptPending);
                    row.createCell(6).setCellValue(integerAmount(bill.get("monthlyRent"))
                            + integerAmount(bill.get("foodCharges"))
                            + integerAmount(bill.get("electricityCharges")) + scriptPending);
                }
                sheet.createFreezePane(0,2); sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(1,1,0,headers.length-1));
            } else {
                Sheet sheet=wb.createSheet("Monthly Report");
                String[] headers={"Bill ID","Tenant","Phone","Room","Month","Rent","Food","EB Units","EB Rate","EB Room Total","Electricity Share","Previous Due","Other","Discount","Total","Paid","Pending","Status"};
                Row header=sheet.createRow(0); CellStyle style=headerStyle(wb);
                String[] fields={"billId","tenantName","","roomNumber","billingMonth","monthlyRent","foodCharges","electricityUnits","electricityRate","electricityRoomTotal","electricityCharges","previousBalance","otherCharges","discount","totalAmount","amountPaid","remainingBalance","paymentStatus"};
                for(int i=0;i<headers.length;i++){Cell c=header.createCell(i);c.setCellValue(headers[i]);c.setCellStyle(style);sheet.setColumnWidth(i,Math.min(28,Math.max(14,headers[i].length()+5))*256);}
                int rowIndex=1;
                for(Map<String,String> bill:bills){Row row=sheet.createRow(rowIndex++);Map<String,String> tenant=tenants.getOrDefault(bill.get("tenantId"),Map.of());
                    for(int i=0;i<fields.length;i++){String field=fields[i];String value="Phone".equals(headers[i])?tenant.getOrDefault("phoneNumber",""):bill.getOrDefault(field,"");row.createCell(i).setCellValue(value);}}
                sheet.createFreezePane(0,1);sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0,0,0,headers.length-1));
            }
            wb.write(out); return out.toByteArray();
        } catch(IOException ex){throw new IllegalStateException("Report generation failed",ex);}
    }
    private CellStyle headerStyle(Workbook wb){CellStyle style=wb.createCellStyle();Font font=wb.createFont();font.setBold(true);style.setFont(font);return style;}
    private String scriptPhone(String value) {
        String digits = value == null ? "" : value.replaceAll("\\D", "");
        if (digits.startsWith("91") && digits.length() == 12) digits = digits.substring(2);
        if (digits.startsWith("0") && digits.length() == 11) digits = digits.substring(1);
        return digits;
    }
    private double integerAmount(String value){return new BigDecimal(value==null||value.isBlank()?"0":value).setScale(0,RoundingMode.HALF_UP).doubleValue();}
    private String safeSheetName(String month){String name=month.replaceAll("[^A-Za-z0-9 _-]","-");return name.length()>31?name.substring(0,31):name;}
}

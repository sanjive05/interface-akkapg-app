package com.pgmanagement.service;

import com.pgmanagement.dto.TenantRequest;
import com.pgmanagement.excel.ExcelStorageService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Pattern;

@Service
public class TenantService {
    private static final String FILE = "tenants.xlsx";
    private static final Set<String> STATUSES = Set.of("ACTIVE", "VACATED");

    private final ExcelStorageService excel;
    private final PgOperationsService operations;

    public TenantService(ExcelStorageService excel, PgOperationsService operations) {
        this.excel = excel;
        this.operations = operations;
    }

    public List<Map<String, String>> getAll(String search, String status) {
        String term = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        String normalizedStatus = status == null || status.isBlank() ? "ALL" : status.trim().toUpperCase(Locale.ROOT);

        return excel.readAll(FILE).stream()
                .filter(row -> normalizedStatus.equals("ALL") ||
                        normalizedStatus.equals(row.getOrDefault("status", "ACTIVE").toUpperCase(Locale.ROOT)))
                .filter(row -> term.isBlank()
                        || contains(row.get("fullName"), term)
                        || contains(row.get("phoneNumber"), term)
                        || contains(row.get("tenantId"), term)
                        || contains(row.get("roomId"), term))
                .sorted(Comparator.comparing(row -> row.getOrDefault("fullName", ""),
                        String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public Map<String, String> getById(String id) {
        Map<String, String> tenant = excel.findById(FILE, id);
        if (tenant == null) throw new NoSuchElementException("Tenant not found: " + id);
        return tenant;
    }

    public Map<String, String> create(TenantRequest request) {
        validate(request);
        ensurePhoneUnique(request.phoneNumber(), null);
        if ("ACTIVE".equalsIgnoreCase(request.status())) operations.assertRoomCapacity(request.roomId(), null, request.bedNumber());

        Map<String, String> tenant = toMap(request);
        tenant.put("tenantId", nextTenantId());
        excel.append(FILE, tenant);
        return getById(tenant.get("tenantId"));
    }

    public Map<String, String> update(String id, TenantRequest request) {
        getById(id);
        validate(request);
        ensurePhoneUnique(request.phoneNumber(), id);
        if ("ACTIVE".equalsIgnoreCase(request.status())) operations.assertRoomCapacity(request.roomId(), id, request.bedNumber());

        Map<String, String> updates = toMap(request);
        updates.remove("tenantId");
        excel.updateById(FILE, id, updates);
        return getById(id);
    }

    public Map<String, String> vacate(String id, LocalDate vacatingDate) {
        Map<String, String> current = getById(id);
        LocalDate joiningDate = LocalDate.parse(current.get("joiningDate"));
        if (vacatingDate == null) throw new IllegalArgumentException("Vacating date is required");
        if (vacatingDate.isBefore(joiningDate)) {
            throw new IllegalArgumentException("Vacating date cannot be before joining date");
        }
        Map<String, String> updates = new LinkedHashMap<>();
        updates.put("vacatingDate", vacatingDate.toString());
        updates.put("status", "VACATED");
        excel.updateById(FILE, id, updates);
        return getById(id);
    }

    private void validate(TenantRequest request) {
        String status = request.status().trim().toUpperCase(Locale.ROOT);
        if (!STATUSES.contains(status)) throw new IllegalArgumentException("Status must be ACTIVE or VACATED");
        if (request.vacatingDate() != null && request.vacatingDate().isBefore(request.joiningDate())) {
            throw new IllegalArgumentException("Vacating date cannot be before joining date");
        }
        if ("VACATED".equals(status) && request.vacatingDate() == null) {
            throw new IllegalArgumentException("Vacating date is required for a vacated tenant");
        }
        if (request.phoneNumber().isBlank()) throw new IllegalArgumentException("Phone number is required");
        if (!request.foodIncluded() && request.monthlyFoodAmount().signum() > 0) {
            throw new IllegalArgumentException("Set food amount to zero when food is not included");
        }
        if (request.advancePaid().compareTo(request.advanceAmount()) > 0) {
            throw new IllegalArgumentException("Advance received cannot exceed the agreed advance amount");
        }
    }

    private void ensurePhoneUnique(String phone, String exceptId) {
        String normalized = normalizePhone(phone);
        // Older rent sheets occasionally omit a phone number. Allow multiple blank
        // imported phone fields so each historic tenant can be updated independently.
        if (normalized.isBlank()) return;
        boolean duplicate = excel.readAll(FILE).stream()
                .anyMatch(row -> !Objects.equals(row.get("tenantId"), exceptId)
                        && normalized.equals(normalizePhone(row.get("phoneNumber"))));
        if (duplicate) throw new IllegalArgumentException("A tenant with this phone number already exists");
    }

    private Map<String, String> toMap(TenantRequest request) {
        Map<String, String> row = new LinkedHashMap<>();
        row.put("tenantId", "");
        row.put("fullName", clean(request.fullName()));
        row.put("age", String.valueOf(request.age()));
        row.put("gender", clean(request.gender()));
        row.put("phoneNumber", clean(request.phoneNumber()));
        row.put("email", clean(request.email()));
        row.put("address", clean(request.address()));
        row.put("emergencyContact", clean(request.emergencyContact()));
        row.put("joiningDate", request.joiningDate().toString());
        row.put("vacatingDate", request.vacatingDate() == null ? "" : request.vacatingDate().toString());
        row.put("roomId", clean(request.roomId()));
        row.put("bedNumber", clean(request.bedNumber()));
        row.put("monthlyRent", request.monthlyRent().setScale(2).toPlainString());
        row.put("foodIncluded", request.foodIncluded().toString());
        row.put("monthlyFoodAmount", request.monthlyFoodAmount().setScale(2).toPlainString());
        row.put("advanceAmount", request.advanceAmount().setScale(2).toPlainString());
        row.put("advancePaid", request.advancePaid().setScale(2).toPlainString());
        row.put("status", request.status().trim().toUpperCase(Locale.ROOT));
        row.put("notes", clean(request.notes()));
        return row;
    }

    private String nextTenantId() {
        long max = 0;
        Pattern pattern = Pattern.compile("^TEN-(\\d+)$");
        for (Map<String, String> row : excel.readAll(FILE)) {
            var matcher = pattern.matcher(Objects.toString(row.get("tenantId"), ""));
            if (matcher.matches()) max = Math.max(max, Long.parseLong(matcher.group(1)));
        }
        return "TEN-" + String.format(Locale.ROOT, "%06d", max + 1);
    }

    private String normalizePhone(String value) {
        return Objects.toString(value, "").replaceAll("[^0-9]", "");
    }

    private boolean contains(String value, String term) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(term);
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}

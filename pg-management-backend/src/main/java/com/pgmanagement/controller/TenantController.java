package com.pgmanagement.controller;

import com.pgmanagement.dto.TenantRequest;
import com.pgmanagement.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {
    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping
    public List<Map<String, String>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ALL") String status) {
        return tenantService.getAll(search, status);
    }

    @GetMapping("/{id}")
    public Map<String, String> getById(@PathVariable String id) {
        return tenantService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> create(@Valid @RequestBody TenantRequest request) {
        return tenantService.create(request);
    }

    @PutMapping("/{id}")
    public Map<String, String> update(@PathVariable String id, @Valid @RequestBody TenantRequest request) {
        return tenantService.update(id, request);
    }

    @PatchMapping("/{id}/vacate")
    public Map<String, String> vacate(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return tenantService.vacate(id, date);
    }
}

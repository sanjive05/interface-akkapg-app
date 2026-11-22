package com.pgmanagement.controller;

import com.pgmanagement.excel.ExcelDefinitions;
import com.pgmanagement.excel.ExcelStorageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    private final ExcelStorageService storageService;
    private final ExcelDefinitions definitions;

    public HealthController(ExcelStorageService storageService, ExcelDefinitions definitions) {
        this.storageService = storageService;
        this.definitions = definitions;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("application", "PG Management System");
        response.put("storage", "SQLite");
        response.put("databaseFile", storageService.getDatabaseFile().toString());
        response.put("dataDirectory", storageService.getDataDirectory().toString());
        response.put("initializedFiles", definitions.all().stream()
                .map(definition -> definition.fileName()).toList());
        return response;
    }
}

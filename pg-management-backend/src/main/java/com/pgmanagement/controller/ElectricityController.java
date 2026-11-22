package com.pgmanagement.controller;

import com.pgmanagement.service.PgOperationsService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/electricity")
public class ElectricityController {
    private final PgOperationsService service;
    public ElectricityController(PgOperationsService service) { this.service = service; }
    @GetMapping("/readings") public List<Map<String,String>> readings(@RequestParam(required=false) String month) { return service.electricityReadings(month); }
    @PostMapping("/readings") @ResponseStatus(HttpStatus.CREATED)
    public Map<String,String> save(@RequestBody Map<String,String> payload) { return service.saveElectricityReading(payload, null); }
    @PutMapping("/readings/{id}")
    public Map<String,String> update(@PathVariable String id, @RequestBody Map<String,String> payload) { return service.saveElectricityReading(payload, id); }
}

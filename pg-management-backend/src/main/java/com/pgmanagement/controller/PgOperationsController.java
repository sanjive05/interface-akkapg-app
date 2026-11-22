package com.pgmanagement.controller;

import com.pgmanagement.service.PgOperationsService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.YearMonth;
import java.util.*;

@RestController
@RequestMapping("/api")
public class PgOperationsController {
    private final PgOperationsService service;
    public PgOperationsController(PgOperationsService service) {this.service=service;}
    @GetMapping("/rooms") public List<Map<String,String>> rooms() {return service.rooms();}
    @PostMapping("/rooms") @ResponseStatus(HttpStatus.CREATED) public Map<String,String> addRoom(@RequestBody Map<String,String> data) {return service.saveRoom(data,null);}
    @PutMapping("/rooms/{id}") public Map<String,String> updateRoom(@PathVariable String id,@RequestBody Map<String,String> data) {return service.saveRoom(data,id);}
    @GetMapping("/billing") public List<Map<String,String>> bills(@RequestParam(required=false) String month) {return service.bills(month);}
    @PostMapping("/billing/generate") public List<Map<String,String>> generate(@RequestParam String month) {return service.generateBills(month);}
    @PutMapping("/billing/{id}") public Map<String,String> updateBill(@PathVariable String id,@RequestBody Map<String,String> data) {return service.updateBill(id,data);}
    @GetMapping("/payments") public List<Map<String,String>> payments(@RequestParam(required=false) String month) {return service.payments(month);}
    @PostMapping("/payments") @ResponseStatus(HttpStatus.CREATED) public Map<String,String> payment(@RequestBody Map<String,String> data) {return service.addPayment(data);}
    @GetMapping("/dashboard") public Map<String,Object> dashboard(@RequestParam(defaultValue="") String month) {return service.dashboard(month.isBlank()?YearMonth.now().toString():month);}
    @GetMapping("/settings") public List<Map<String,String>> settings() {return service.settings();}
    @PutMapping("/settings") public Map<String,String> settings(@RequestBody Map<String,String> settings) {service.saveSettings(settings);return Map.of("status","saved");}
}

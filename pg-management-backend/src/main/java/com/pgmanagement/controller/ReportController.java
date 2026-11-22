package com.pgmanagement.controller;
import com.pgmanagement.service.ReportService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.YearMonth;
@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService service;
    public ReportController(ReportService service){this.service=service;}
    @GetMapping("/whatsapp/export")
    public ResponseEntity<byte[]> whatsapp(@RequestParam String month){
        YearMonth.parse(month);
        String pg = com.pgmanagement.config.PgContext.get().equals("SUBASH-PG") ? "SUBASH-PG" : "AKKA-PG";
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename="+pg+"-WhatsApp-"+month+".xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(service.whatsapp(month));
    }
    @GetMapping("/monthly/export")
    public ResponseEntity<byte[]> export(@RequestParam String month){
        YearMonth.parse(month);
        String pg = com.pgmanagement.config.PgContext.get().equals("SUBASH-PG") ? "SUBASH-PG" : "AKKA-PG";
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename="+pg+"-"+month+".xlsx")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(service.monthly(month));
    }
}

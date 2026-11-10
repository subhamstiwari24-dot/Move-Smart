package com.movesmart.movesmart_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "UP");
        resp.put("service", "MoveSmart Urban Mobility API");
        resp.put("version", "1.0.0");
        resp.put("timestamp", Instant.now().toString());
        resp.put("database", "Connected");
        return ResponseEntity.ok(resp);
    }
}

package org.example.adminservice.controller;

import org.example.adminservice.client.DoctorClient;
import org.example.adminservice.client.PatientClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private PatientClient patientClient;

    @Autowired
    private DoctorClient doctorClient;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        try {
            stats.put("totalPatients", patientClient.getTotalPatients());
        } catch (Exception e) {
            stats.put("totalPatients", 0);
        }
        try {
            stats.put("totalDoctors", doctorClient.getTotalDoctors());
        } catch (Exception e) {
            stats.put("totalDoctors", 0);
        }
        return ResponseEntity.ok(stats);
    }
}

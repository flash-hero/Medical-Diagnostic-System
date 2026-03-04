package org.example.authservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "patient-service")
public interface PatientClient {
    
    @PostMapping("/api/patients")
    Map<String, Object> createPatient(@RequestBody Map<String, Object> patientData);
    
    @GetMapping("/api/patients/username/{username}")
    Map<String, Object> getPatientByUsername(@PathVariable String username);
    
    @PutMapping("/api/patients/username/{username}")
    Map<String, Object> updatePatientByUsername(@PathVariable String username, @RequestBody Map<String, Object> patientData);
}

package org.example.patientservice.controller;

import org.example.patientservice.dto.PatientDashboardStats;
import org.example.patientservice.entity.MedicalRecord;
import org.example.patientservice.entity.Patient;
import org.example.patientservice.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;


    @PutMapping("/profile")
    public ResponseEntity<Patient> updateProfile(@RequestBody Patient patient,
                                                 @RequestHeader("loggedInUser") String username) {
        return ResponseEntity.ok(patientService.createOrUpdateProfile(username, patient));
    }

    @GetMapping("/profile")
    public ResponseEntity<Patient> getProfile(@RequestHeader("loggedInUser") String username) {
        return ResponseEntity.ok(patientService.getPatientProfile(username));
    }

    @GetMapping("/history")
    public ResponseEntity<List<MedicalRecord>> getHistory(@RequestHeader("loggedInUser") String username) {
        return ResponseEntity.ok(patientService.getPatientHistory(username));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<PatientDashboardStats> getDashboardStats(@RequestHeader("loggedInUser") String username) {
        return ResponseEntity.ok(patientService.getDashboardStats(username));
    }
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalPatients() {
        return ResponseEntity.ok(patientService.getTotalPatientsCount());
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<Patient> getPatientByUsername(@PathVariable String username) {
        return ResponseEntity.ok(patientService.getPatientProfile(username));
    }
    
    @PutMapping("/username/{username}")
    public ResponseEntity<Patient> updatePatientByUsername(@PathVariable String username, @RequestBody Patient patient) {
        return ResponseEntity.ok(patientService.createOrUpdateProfile(username, patient));
    }
    
    // Create patient record during registration (auto-called by auth-service)
    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody java.util.Map<String, Object> patientData) {
        String username = (String) patientData.get("username");
        Patient patient = new Patient();
        patient.setUsername(username);
        // Other fields remain null until user updates profile
        return ResponseEntity.ok(patientService.createOrUpdateProfile(username, patient));
    }
}
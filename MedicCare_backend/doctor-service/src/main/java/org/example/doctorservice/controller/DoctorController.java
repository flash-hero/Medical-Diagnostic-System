package org.example.doctorservice.controller;

import org.example.doctorservice.entity.Doctor;
import org.example.doctorservice.repository.DoctorRepository;
import org.example.doctorservice.proxy.AppointmentProxy;
import org.example.doctorservice.proxy.UserProxy;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final AppointmentProxy appointmentProxy;
    private final UserProxy userProxy;


    public DoctorController(DoctorRepository doctorRepository, AppointmentProxy appointmentProxy, UserProxy userProxy) {
        this.doctorRepository = doctorRepository;
        this.appointmentProxy = appointmentProxy;
        this.userProxy = userProxy;
    }

    @GetMapping("/all")
    public List<Doctor> getAllDoctors() {
        // Return only active doctors (exclude PENDING and SUSPENDED)
        try {
            // Fetch all users from auth-service
            List<Map<String, Object>> users = userProxy.getAllUsers();
            
            // Get usernames of active doctors
            List<String> activeDoctorUsernames = users.stream()
                .filter(user -> "DOCTOR".equalsIgnoreCase((String) user.get("role")))
                .filter(user -> "ACTIVE".equalsIgnoreCase((String) user.get("status")))
                .map(user -> (String) user.get("username"))
                .collect(Collectors.toList());
            
            // Filter doctors by active usernames
            return doctorRepository.findAll().stream()
                .filter(doctor -> activeDoctorUsernames.contains(doctor.getUsername()))
                .collect(Collectors.toList());
        } catch (Exception e) {
            // If auth-service is unreachable, return empty list for safety
            return List.of();
        }
    }
    
    // Alias for getAllDoctors - returns only active doctors
    @GetMapping("/active")
    public List<Doctor> getActiveDoctors() {
        return getAllDoctors();
    }

    @PostMapping("/add")
    public Doctor saveDoctor(@RequestBody Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor details) {
        return doctorRepository.findById(id).map(doctor -> {
            doctor.setFirstName(details.getFirstName());
            doctor.setLastName(details.getLastName());
            doctor.setSpecialty(details.getSpecialty());
            doctor.setEmail(details.getEmail());
            doctor.setPhoneNumber(details.getPhoneNumber());
            doctor.setUsername(details.getUsername());
            return ResponseEntity.ok(doctorRepository.save(doctor));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        if (doctorRepository.existsById(id)) {
            doctorRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }


    @GetMapping("/appointments/{doctorName}")
    public ResponseEntity<List<Object>> getDoctorAppointments(@PathVariable String doctorName) {

        return ResponseEntity.ok(appointmentProxy.getDoctorAppointments(doctorName));
    }


    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<Object> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(appointmentProxy.updateStatus(id, status));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getDoctorCount() {
        return ResponseEntity.ok(doctorRepository.count());
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<Doctor> getDoctorByUsername(@PathVariable String username) {
        return doctorRepository.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/username/{username}")
    public ResponseEntity<Doctor> updateDoctorByUsername(@PathVariable String username, @RequestBody Doctor doctorData) {
        return doctorRepository.findByUsername(username)
                .map(doctor -> {
                    if (doctorData.getFirstName() != null) doctor.setFirstName(doctorData.getFirstName());
                    if (doctorData.getLastName() != null) doctor.setLastName(doctorData.getLastName());
                    if (doctorData.getSpecialty() != null) doctor.setSpecialty(doctorData.getSpecialty());
                    if (doctorData.getEmail() != null) doctor.setEmail(doctorData.getEmail());
                    if (doctorData.getPhoneNumber() != null) doctor.setPhoneNumber(doctorData.getPhoneNumber());
                    return ResponseEntity.ok(doctorRepository.save(doctor));
                })
                .orElseGet(() -> {
                    Doctor newDoctor = new Doctor();
                    newDoctor.setUsername(username);
                    newDoctor.setFirstName(doctorData.getFirstName());
                    newDoctor.setLastName(doctorData.getLastName());
                    newDoctor.setSpecialty(doctorData.getSpecialty());
                    newDoctor.setEmail(doctorData.getEmail());
                    newDoctor.setPhoneNumber(doctorData.getPhoneNumber());
                    return ResponseEntity.ok(doctorRepository.save(newDoctor));
                });
    }
    
    // Create doctor record during registration (auto-called by auth-service)
    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody java.util.Map<String, Object> doctorData) {
        Doctor doctor = new Doctor();
        doctor.setUsername((String) doctorData.get("username"));
        doctor.setEmail((String) doctorData.get("email"));
        // Other fields remain null until user updates profile
        return ResponseEntity.ok(doctorRepository.save(doctor));
    }
}
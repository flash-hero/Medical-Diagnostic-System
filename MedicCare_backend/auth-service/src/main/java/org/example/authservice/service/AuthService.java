package org.example.authservice.service;

import org.example.authservice.entity.User;
import org.example.authservice.repository.UserRepository;
import org.example.authservice.client.PatientClient;
import org.example.authservice.client.DoctorClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private PatientClient patientClient;
    
    @Autowired
    private DoctorClient doctorClient;

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Normalize role to uppercase
        if (user.getRole() != null) {
            user.setRole(user.getRole().toUpperCase());
        }
        
        // Set default status based on role
        if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            user.setStatus("PENDING"); // Doctors need admin approval
        } else {
            user.setStatus("ACTIVE"); // Patients and Admins are active immediately
        }
        
        // Save user to database
        User savedUser = userRepository.save(user);
        
        // Create corresponding Doctor or Patient record
        createRoleSpecificRecord(savedUser);
        
        return savedUser;
    }
    
    private void createRoleSpecificRecord(User user) {
        Map<String, Object> recordData = new HashMap<>();
        recordData.put("username", user.getUsername());
        recordData.put("email", user.getEmail());
        
        try {
            if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
                doctorClient.createDoctor(recordData);
            } else if ("PATIENT".equalsIgnoreCase(user.getRole())) {
                patientClient.createPatient(recordData);
            }
            // Note: already using equalsIgnoreCase here
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Warning: Failed to create role-specific record for " + user.getUsername() + ": " + e.getMessage());
        }
    }

    public String authenticateAndGenerateToken(String username, String password) {
        User foundUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user account is suspended
        if ("SUSPENDED".equalsIgnoreCase(foundUser.getStatus())) {
            // Check if suspension has expired
            if (foundUser.getSuspensionEndDate() != null) {
                LocalDateTime suspensionEnd = LocalDateTime.parse(foundUser.getSuspensionEndDate(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                if (LocalDateTime.now().isAfter(suspensionEnd)) {
                    // Automatically unsuspend
                    foundUser.setStatus("ACTIVE");
                    foundUser.setSuspensionEndDate(null);
                    userRepository.save(foundUser);
                } else {
                    throw new RuntimeException("Account suspended until " + foundUser.getSuspensionEndDate());
                }
            } else {
                throw new RuntimeException("Account suspended indefinitely");
            }
        }

        if (passwordEncoder.matches(password, foundUser.getPassword())) {
            return jwtService.generateToken(foundUser.getUsername(), foundUser.getRole());
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }
    
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
    
    public User updateUser(Long id, Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        if (updates.containsKey("username")) {
            String newUsername = (String) updates.get("username");
            if (!newUsername.equals(user.getUsername()) && userRepository.findByUsername(newUsername).isPresent()) {
                throw new RuntimeException("Username already taken");
            }
            user.setUsername(newUsername);
        }
        if (updates.containsKey("email")) {
            user.setEmail((String) updates.get("email"));
        }
        if (updates.containsKey("role")) {
            user.setRole((String) updates.get("role"));
        }
        if (updates.containsKey("status")) {
            user.setStatus((String) updates.get("status"));
        }
        
        return userRepository.save(user);
    }
    
    public Map<String, Object> getUserProfile(String username) {
        User user = getUserByUsername(username);
        Map<String, Object> profile = new HashMap<>();
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        
        // Fetch role-specific data
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {
            try {
                Map<String, Object> patientData = patientClient.getPatientByUsername(username);
                profile.putAll(patientData);
            } catch (Exception e) {
                // Patient record may not exist yet
            }
        } else if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            try {
                Map<String, Object> doctorData = doctorClient.getDoctorByUsername(username);
                profile.putAll(doctorData);
            } catch (Exception e) {
                // Doctor record may not exist yet
            }
        }
        
        return profile;
    }
    
    public Map<String, Object> updateUserProfile(String username, Map<String, Object> profileData) {
        User user = getUserByUsername(username);
        
        // Update email in User table if provided
        if (profileData.containsKey("email")) {
            user.setEmail((String) profileData.get("email"));
            userRepository.save(user);
        }
        
        // Update role-specific data
        if ("PATIENT".equalsIgnoreCase(user.getRole())) {
            try {
                patientClient.updatePatientByUsername(username, profileData);
            } catch (Exception e) {
                throw new RuntimeException("Failed to update patient profile: " + e.getMessage());
            }
        } else if ("DOCTOR".equalsIgnoreCase(user.getRole())) {
            try {
                doctorClient.updateDoctorByUsername(username, profileData);
            } catch (Exception e) {
                throw new RuntimeException("Failed to update doctor profile: " + e.getMessage());
            }
        }
        
        return getUserProfile(username);
    }
    
    // Admin suspension functionality
    public User suspendUser(Long userId, String endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        user.setStatus("SUSPENDED");
        user.setSuspensionEndDate(endDate);
        return userRepository.save(user);
    }
    
    public User unsuspendUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        user.setStatus("ACTIVE");
        user.setSuspensionEndDate(null);
        return userRepository.save(user);
    }
    
    // Approve doctor (change status from PENDING to ACTIVE)
    public User approveDoctor(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        if (!"DOCTOR".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("User is not a doctor");
        }
        
        if (!"PENDING".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("Doctor status is not pending");
        }
        
        user.setStatus("ACTIVE");
        return userRepository.save(user);
    }
}
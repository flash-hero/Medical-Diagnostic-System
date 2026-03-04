package org.example.patientservice.service;

import org.example.patientservice.dto.PatientDashboardStats;
import org.example.patientservice.entity.MedicalRecord;
import org.example.patientservice.entity.Patient;
import org.example.patientservice.repository.AppointmentRepository;
import org.example.patientservice.repository.MedicalRecordRepository;
import org.example.patientservice.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {
    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private MedicalRecordRepository medicalRecordRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    public PatientDashboardStats getDashboardStats(String username) {
        long appointmentsCount = appointmentRepository.countByPatient_Username(username);
        long recordsCount = medicalRecordRepository.countByPatient_Username(username);


        String bloodGroup = patientRepository.findByUsername(username)
                .map(Patient::getBloodGroup)
                .orElse("N/A");


        return new PatientDashboardStats(appointmentsCount, recordsCount, bloodGroup, 85);
    }

    public Patient getPatientProfile(String username) {
        return patientRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + username));
    }

    public Patient updateProfile(String username, Patient updatedData) {
        Patient patient = getPatientProfile(username);
        patient.setFirstName(updatedData.getFirstName());
        patient.setLastName(updatedData.getLastName());
        patient.setPhoneNumber(updatedData.getPhoneNumber());
        patient.setAddress(updatedData.getAddress());
        patient.setBloodGroup(updatedData.getBloodGroup());
        return patientRepository.save(patient);
    }

    public List<MedicalRecord> getPatientHistory(String username) {
        return medicalRecordRepository.findByPatient_UsernameOrderByDateDesc(username);
    }

    public Patient createOrUpdateProfile(String username, Patient updatedData) {

        Patient patient = patientRepository.findByUsername(username)
                .orElse(new Patient());

        patient.setUsername(username);
        patient.setFirstName(updatedData.getFirstName());
        patient.setLastName(updatedData.getLastName());
        patient.setPhoneNumber(updatedData.getPhoneNumber());
        patient.setAddress(updatedData.getAddress());
        patient.setBloodGroup(updatedData.getBloodGroup());

        return patientRepository.save(patient);
    }
    public long getTotalPatientsCount() {
        return patientRepository.count();
    }
}
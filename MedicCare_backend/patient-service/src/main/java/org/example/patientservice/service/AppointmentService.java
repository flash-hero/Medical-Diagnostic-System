package org.example.patientservice.service;

import org.example.patientservice.entity.Appointment;
import org.example.patientservice.entity.Patient;
import org.example.patientservice.repository.AppointmentRepository;
import org.example.patientservice.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;


    public Appointment bookAppointment(Appointment appointment, String username) {
        Patient patient = patientRepository.findByUsername(username)
                .orElseGet(() -> {
                    Patient newPatient = new Patient();
                    newPatient.setUsername(username);
                    return patientRepository.save(newPatient);
                });

        appointment.setPatient(patient);
        appointment.setStatus("PENDING");

        return appointmentRepository.save(appointment);
    }


    public List<Appointment> getAppointmentsByPatient(String username) {
        return appointmentRepository.findByPatient_Username(username);
    }


    public Appointment cancelAppointment(Long appointmentId, String username) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getPatient().getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to cancel this appointment");
        }

        appointment.setStatus("CANCELLED");
        return appointmentRepository.save(appointment);
    }




    public List<Appointment> getAppointmentsByDoctor(String doctorName) {
        return appointmentRepository.findByDoctorName(doctorName);
    }


    public Appointment updateStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));


        appointment.setStatus(status.toUpperCase());

        return appointmentRepository.save(appointment);
    }
    public Map<String, Long> getDoctorDashboardStats(String doctorName) {
        Map<String, Long> stats = new HashMap<>();

        stats.put("todayAppointments", appointmentRepository.countTodayAppointments(doctorName));
        stats.put("pendingRequests", appointmentRepository.countByDoctorNameAndStatus(doctorName, "PENDING"));
        stats.put("totalPatients", appointmentRepository.countTotalPatientsByDoctor(doctorName));

        stats.put("completedAppointments", appointmentRepository.countByDoctorNameAndStatus(doctorName, "COMPLETED"));

        return stats;
    }
}
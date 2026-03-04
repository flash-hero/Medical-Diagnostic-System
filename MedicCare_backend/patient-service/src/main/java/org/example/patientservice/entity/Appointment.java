package org.example.patientservice.entity;

import jakarta.persistence.*; 
import lombok.*;            
import java.time.LocalDate;  
import java.time.LocalTime;  

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient; 

    private Long doctorId;
    private String doctorName; 
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String reason;
    private String status;
}
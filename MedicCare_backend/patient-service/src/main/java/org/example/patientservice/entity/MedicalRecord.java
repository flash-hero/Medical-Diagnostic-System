package org.example.patientservice.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "medical_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String type;
    private LocalDate date;
    private String doctorName;

    @Column(length = 1000)
    private String notes;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;
}

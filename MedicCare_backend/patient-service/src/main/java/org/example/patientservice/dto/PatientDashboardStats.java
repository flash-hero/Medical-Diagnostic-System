package org.example.patientservice.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class PatientDashboardStats {
    private long appointmentCount;
    private long medicalRecordsCount;
    private String bloodGroup;
    private int healthScore;
}

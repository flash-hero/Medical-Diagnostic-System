package org.example.patientservice.repository;

import org.example.patientservice.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {


    List<Appointment> findByPatient_Username(String username);

    long countByPatient_Username(String username);

    List<Appointment> findByDoctorName(String doctorName);

    List<Appointment> findByDoctorId(Long doctorId);

    long countByDoctorNameAndStatus(String doctorName, String status);



    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorName = :doctorName AND a.appointmentDate = CURRENT_DATE")
    long countTodayAppointments(@Param("doctorName") String doctorName);


    @Query("SELECT COUNT(DISTINCT a.patient.id) FROM Appointment a WHERE a.doctorName = :doctorName")
    long countTotalPatientsByDoctor(@Param("doctorName") String doctorName);

}
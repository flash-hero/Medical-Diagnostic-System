package org.example.patientservice.repository;
import org.example.patientservice.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long>{

    List<MedicalRecord> findByPatient_UsernameOrderByDateDesc(String username);
    long countByPatient_Username(String username);
}

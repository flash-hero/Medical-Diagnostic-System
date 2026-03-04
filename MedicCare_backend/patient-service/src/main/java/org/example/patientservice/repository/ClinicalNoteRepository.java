package org.example.patientservice.repository;

import org.example.patientservice.entity.ClinicalNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClinicalNoteRepository extends JpaRepository<ClinicalNote, Long> {
    List<ClinicalNote> findByPatientUsernameOrderByCreatedAtDesc(String username);
}

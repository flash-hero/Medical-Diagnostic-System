package org.example.adminservice.client;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "patient-service")
public interface PatientClient {
    @GetMapping("/api/patients/count")
    Long getTotalPatients();
}

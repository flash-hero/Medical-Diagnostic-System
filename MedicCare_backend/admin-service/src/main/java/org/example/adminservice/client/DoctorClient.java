package org.example.adminservice.client;



import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "doctor-service")
public interface DoctorClient {
    @GetMapping("/doctors/count")
    Long getTotalDoctors();
}

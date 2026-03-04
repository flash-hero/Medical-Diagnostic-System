package org.example.doctorservice.proxy;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
@FeignClient(name = "patient-service", path = "/api/appointments")


public interface AppointmentProxy {

    @GetMapping("/doctor/{doctorName}")
    List<Object> getDoctorAppointments(@PathVariable String doctorName);


    @PutMapping("/{id}/status")
    Object updateStatus(@PathVariable Long id, @RequestParam String status);
}

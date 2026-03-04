package org.example.doctorservice.proxy;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "auth-service", path = "/auth")
public interface UserProxy {
    
    @GetMapping("/users")
    List<Map<String, Object>> getAllUsers();
}

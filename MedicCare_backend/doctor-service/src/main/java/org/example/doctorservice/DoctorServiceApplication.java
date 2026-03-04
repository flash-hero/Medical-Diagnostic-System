package org.example.doctorservice;

import org.example.doctorservice.entity.Doctor;
import org.example.doctorservice.repository.DoctorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableFeignClients
public class DoctorServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DoctorServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner start(DoctorRepository doctorRepository) {
        return args -> {

            if (doctorRepository.count() == 0) {
                doctorRepository.save(new Doctor(null, "dr_ahmed", "Ahmed", "Alami", "Cardiology", "0612345678", "ahmed@mail.com"));
                doctorRepository.save(new Doctor(null, "dr_sanaa", "Sanaa", "Mabrour", "Dermatology", "0687654321", "sanaa@mail.com"));
                System.out.println("Initial doctors added to database.");
            } else {
                System.out.println("Doctors already exist in database, skipping initialization.");
            }

            doctorRepository.findAll().forEach(d -> {
                System.out.println("Doctor found: " + d.getFirstName() + " " + d.getLastName());
            });
        };
    }
}
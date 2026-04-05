package com.application.AKKAPG.repo;

import com.application.AKKAPG.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment,Long> {
}

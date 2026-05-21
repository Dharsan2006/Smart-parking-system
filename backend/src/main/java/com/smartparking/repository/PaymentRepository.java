package com.smartparking.repository;

import com.smartparking.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    Optional<Payment> findByTransactionId(String transactionId);

    @Query("SELECT p FROM Payment p WHERE p.booking.user.id = :userId ORDER BY p.paymentTime DESC")
    List<Payment> findByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED' AND p.paymentTime BETWEEN :start AND :end")
    Double getRevenueBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}

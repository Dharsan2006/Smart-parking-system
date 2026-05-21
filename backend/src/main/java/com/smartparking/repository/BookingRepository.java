package com.smartparking.repository;

import com.smartparking.model.Booking;
import com.smartparking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserOrderByBookingTimeDesc(User user);
    List<Booking> findByStatus(Booking.BookingStatus status);
    Optional<Booking> findByQrCode(String qrCode);

    @Query("SELECT b FROM Booking b WHERE b.parkingSlot.id = :slotId AND b.status IN ('CONFIRMED','ACTIVE') " +
           "AND ((b.startTime <= :endTime AND b.endTime >= :startTime))")
    List<Booking> findConflictingBookings(@Param("slotId") Long slotId,
                                          @Param("startTime") LocalDateTime startTime,
                                          @Param("endTime") LocalDateTime endTime);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    long countByStatus(Booking.BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.status = 'ACTIVE' AND b.endTime < :now")
    List<Booking> findExpiredActiveBookings(@Param("now") LocalDateTime now);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED'")
    Double getTotalRevenue();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'COMPLETED' AND p.paymentTime >= :startDate")
    Double getRevenueFromDate(@Param("startDate") LocalDateTime startDate);
}

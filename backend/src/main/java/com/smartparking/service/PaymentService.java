package com.smartparking.service;

import com.smartparking.dto.PaymentRequest;
import com.smartparking.model.Booking;
import com.smartparking.model.Payment;
import com.smartparking.repository.BookingRepository;
import com.smartparking.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Transactional
    public Payment processPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Payment can only be made for completed bookings");
        }

        Payment existingPayment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Payment already completed for this booking");
        }

        Payment payment = existingPayment != null ? existingPayment : new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalAmount());
        payment.setBaseAmount(2.0);
        payment.setDurationHours(booking.getDurationHours());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaymentTime(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    public Payment getPaymentByBookingId(Long bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found for booking: " + bookingId));
    }
}

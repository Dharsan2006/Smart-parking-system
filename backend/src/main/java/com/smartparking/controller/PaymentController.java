package com.smartparking.controller;

import com.smartparking.dto.PaymentRequest;
import com.smartparking.model.Payment;
import com.smartparking.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<?> processPayment(@Valid @RequestBody PaymentRequest request) {
        try {
            Payment payment = paymentService.processPayment(request);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBooking(@PathVariable Long bookingId) {
        try {
            Payment payment = paymentService.getPaymentByBookingId(bookingId);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

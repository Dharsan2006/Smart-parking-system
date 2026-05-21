package com.smartparking.dto;

import com.smartparking.model.Booking;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long slotId;
    private String slotNumber;
    private Integer floorNumber;
    private LocalDateTime bookingTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime actualExitTime;
    private Double durationHours;
    private String vehicleNumber;
    private Booking.BookingStatus status;
    private String qrCode;
    private Double totalAmount;
    private PaymentDto payment;

    @Data
    public static class PaymentDto {
        private Long id;
        private Double amount;
        private String status;
        private String paymentMethod;
        private String transactionId;
        private LocalDateTime paymentTime;
    }
}

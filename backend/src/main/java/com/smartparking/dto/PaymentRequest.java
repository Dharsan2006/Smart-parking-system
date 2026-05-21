package com.smartparking.dto;

import com.smartparking.model.Payment;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {
    @NotNull
    private Long bookingId;

    @NotNull
    private Payment.PaymentMethod paymentMethod;
}

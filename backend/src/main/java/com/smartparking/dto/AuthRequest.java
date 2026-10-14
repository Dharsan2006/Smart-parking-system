package com.smartparking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    public void setEmail(String email) {
        this.email = email != null ? email.trim() : null;
    }
}

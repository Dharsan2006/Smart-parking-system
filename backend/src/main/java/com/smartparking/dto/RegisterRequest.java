package com.smartparking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    private String phone;

    public void setEmail(String email) {
        this.email = email != null ? email.trim() : null;
    }

    public void setName(String name) {
        this.name = name != null ? name.trim() : null;
    }
}

package com.smartparking.dto;

import lombok.Data;

@Data
public class DashboardStats {
    private long totalSlots;
    private long availableSlots;
    private long occupiedSlots;
    private long reservedSlots;
    private long totalBookings;
    private long activeBookings;
    private long completedBookings;
    private Double totalRevenue;
    private Double todayRevenue;
    private Double weekRevenue;
}

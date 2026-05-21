package com.smartparking.service;

import com.smartparking.dto.DashboardStats;
import com.smartparking.model.Booking;
import com.smartparking.model.ParkingSlot;
import com.smartparking.repository.BookingRepository;
import com.smartparking.repository.ParkingSlotRepository;
import com.smartparking.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AdminService {

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public DashboardStats getDashboardStats() {
        DashboardStats stats = new DashboardStats();

        stats.setTotalSlots(parkingSlotRepository.count());
        stats.setAvailableSlots(parkingSlotRepository.countByStatus(ParkingSlot.SlotStatus.AVAILABLE));
        stats.setOccupiedSlots(parkingSlotRepository.countByStatus(ParkingSlot.SlotStatus.OCCUPIED));
        stats.setReservedSlots(parkingSlotRepository.countByStatus(ParkingSlot.SlotStatus.RESERVED));

        stats.setTotalBookings(bookingRepository.count());
        stats.setActiveBookings(bookingRepository.countByStatus(Booking.BookingStatus.ACTIVE));
        stats.setCompletedBookings(bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED));

        Double totalRevenue = bookingRepository.getTotalRevenue();
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : 0.0);

        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        Double todayRevenue = bookingRepository.getRevenueFromDate(todayStart);
        stats.setTodayRevenue(todayRevenue != null ? todayRevenue : 0.0);

        LocalDateTime weekStart = LocalDateTime.now().minusDays(7);
        Double weekRevenue = bookingRepository.getRevenueFromDate(weekStart);
        stats.setWeekRevenue(weekRevenue != null ? weekRevenue : 0.0);

        return stats;
    }
}

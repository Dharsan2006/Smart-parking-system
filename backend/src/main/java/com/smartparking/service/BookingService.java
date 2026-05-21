package com.smartparking.service;

import com.smartparking.dto.BookingRequest;
import com.smartparking.dto.BookingResponse;
import com.smartparking.model.Booking;
import com.smartparking.model.ParkingSlot;
import com.smartparking.model.User;
import com.smartparking.repository.BookingRepository;
import com.smartparking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingSlotService parkingSlotService;

    @Autowired
    private QRCodeService qrCodeService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        User user = getCurrentUser();
        ParkingSlot slot = parkingSlotService.getSlotById(request.getSlotId());

        if (slot.getStatus() != ParkingSlot.SlotStatus.AVAILABLE) {
            throw new RuntimeException("Slot is not available");
        }

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                slot.getId(), request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Slot is already booked for the selected time");
        }

        double hours = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes() / 60.0;
        double amount = calculateAmount(hours, slot.getPricePerHour());

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setParkingSlot(slot);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setVehicleNumber(request.getVehicleNumber());
        booking.setDurationHours(hours);
        booking.setTotalAmount(amount);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);

        Booking saved = bookingRepository.save(booking);

        // Generate QR code
        String qrContent = "BOOKING:" + saved.getId() + ":USER:" + user.getId() + ":SLOT:" + slot.getSlotNumber()
                + ":TOKEN:" + UUID.randomUUID();
        String qrCode = qrCodeService.generateQRCodeBase64(qrContent);
        saved.setQrCode(qrCode);
        saved = bookingRepository.save(saved);

        // Update slot status to RESERVED
        parkingSlotService.updateSlotStatus(slot.getId(), ParkingSlot.SlotStatus.RESERVED);

        return mapToResponse(saved);
    }

    public List<BookingResponse> getUserBookings() {
        User user = getCurrentUser();
        return bookingRepository.findByUserOrderByBookingTimeDesc(user)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse validateQRCode(String qrCode) {
        Booking booking = bookingRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Invalid QR code"));

        if (booking.getStatus() == Booking.BookingStatus.CONFIRMED) {
            booking.setStatus(Booking.BookingStatus.ACTIVE);
            booking.setStartTime(LocalDateTime.now());
            parkingSlotService.updateSlotStatus(booking.getParkingSlot().getId(), ParkingSlot.SlotStatus.OCCUPIED);
            bookingRepository.save(booking);
        }
        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse exitParking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.ACTIVE) {
            throw new RuntimeException("Booking is not active");
        }

        LocalDateTime exitTime = LocalDateTime.now();
        booking.setActualExitTime(exitTime);
        double actualHours = Duration.between(booking.getStartTime(), exitTime).toMinutes() / 60.0;
        booking.setDurationHours(actualHours);
        booking.setTotalAmount(calculateAmount(actualHours, booking.getParkingSlot().getPricePerHour()));
        booking.setStatus(Booking.BookingStatus.COMPLETED);

        parkingSlotService.updateSlotStatus(booking.getParkingSlot().getId(), ParkingSlot.SlotStatus.AVAILABLE);
        bookingRepository.save(booking);

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() == Booking.BookingStatus.ACTIVE || booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel an active or completed booking");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        parkingSlotService.updateSlotStatus(booking.getParkingSlot().getId(), ParkingSlot.SlotStatus.AVAILABLE);
        bookingRepository.save(booking);

        return mapToResponse(booking);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoCompleteExpiredBookings() {
        List<Booking> expired = bookingRepository.findExpiredActiveBookings(LocalDateTime.now());
        for (Booking booking : expired) {
            booking.setStatus(Booking.BookingStatus.COMPLETED);
            booking.setActualExitTime(booking.getEndTime());
            parkingSlotService.updateSlotStatus(booking.getParkingSlot().getId(), ParkingSlot.SlotStatus.AVAILABLE);
            bookingRepository.save(booking);
        }
    }

    private double calculateAmount(double hours, double pricePerHour) {
        double baseRate = 2.0;
        return baseRate + (hours * pricePerHour);
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setUserId(booking.getUser().getId());
        response.setUserName(booking.getUser().getName());
        response.setSlotId(booking.getParkingSlot().getId());
        response.setSlotNumber(booking.getParkingSlot().getSlotNumber());
        response.setFloorNumber(booking.getParkingSlot().getFloorNumber());
        response.setBookingTime(booking.getBookingTime());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setActualExitTime(booking.getActualExitTime());
        response.setDurationHours(booking.getDurationHours());
        response.setVehicleNumber(booking.getVehicleNumber());
        response.setStatus(booking.getStatus());
        response.setQrCode(booking.getQrCode());
        response.setTotalAmount(booking.getTotalAmount());

        if (booking.getPayment() != null) {
            BookingResponse.PaymentDto paymentDto = new BookingResponse.PaymentDto();
            paymentDto.setId(booking.getPayment().getId());
            paymentDto.setAmount(booking.getPayment().getAmount());
            paymentDto.setStatus(booking.getPayment().getStatus().name());
            if (booking.getPayment().getPaymentMethod() != null) {
                paymentDto.setPaymentMethod(booking.getPayment().getPaymentMethod().name());
            }
            paymentDto.setTransactionId(booking.getPayment().getTransactionId());
            paymentDto.setPaymentTime(booking.getPayment().getPaymentTime());
            response.setPayment(paymentDto);
        }

        return response;
    }
}

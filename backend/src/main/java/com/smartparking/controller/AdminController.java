package com.smartparking.controller;

import com.smartparking.dto.BookingResponse;
import com.smartparking.dto.DashboardStats;
import com.smartparking.dto.SlotRequest;
import com.smartparking.model.ParkingSlot;
import com.smartparking.service.AdminService;
import com.smartparking.service.BookingService;
import com.smartparking.service.ParkingSlotService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ParkingSlotService parkingSlotService;

    @Autowired
    private BookingService bookingService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PostMapping("/slots")
    public ResponseEntity<?> createSlot(@Valid @RequestBody SlotRequest request) {
        try {
            ParkingSlot slot = parkingSlotService.createSlot(request);
            return ResponseEntity.ok(slot);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/slots/{id}")
    public ResponseEntity<?> updateSlot(@PathVariable Long id, @Valid @RequestBody SlotRequest request) {
        try {
            ParkingSlot slot = parkingSlotService.updateSlot(id, request);
            return ResponseEntity.ok(slot);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long id) {
        try {
            parkingSlotService.deleteSlot(id);
            return ResponseEntity.ok("Slot deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/slots/{id}/status")
    public ResponseEntity<?> updateSlotStatus(@PathVariable Long id,
                                               @RequestParam ParkingSlot.SlotStatus status) {
        try {
            ParkingSlot slot = parkingSlotService.updateSlotStatus(id, status);
            return ResponseEntity.ok(slot);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

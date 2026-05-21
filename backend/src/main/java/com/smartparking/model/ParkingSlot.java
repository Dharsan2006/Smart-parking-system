package com.smartparking.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "parking_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_number", nullable = false, unique = true)
    private String slotNumber;

    @Column(name = "floor_number")
    private Integer floorNumber = 1;

    @Column(name = "slot_type")
    @Enumerated(EnumType.STRING)
    private SlotType slotType = SlotType.REGULAR;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotStatus status = SlotStatus.AVAILABLE;

    @Column(name = "price_per_hour")
    private Double pricePerHour = 5.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @JsonIgnore
    @OneToMany(mappedBy = "parkingSlot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Booking> bookings;

    public enum SlotStatus {
        AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
    }

    public enum SlotType {
        REGULAR, COMPACT, HANDICAPPED, EV_CHARGING
    }
}

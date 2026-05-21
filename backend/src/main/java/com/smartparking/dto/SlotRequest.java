package com.smartparking.dto;

import com.smartparking.model.ParkingSlot;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SlotRequest {
    @NotBlank
    private String slotNumber;

    @NotNull
    private Integer floorNumber;

    private ParkingSlot.SlotType slotType = ParkingSlot.SlotType.REGULAR;

    private ParkingSlot.SlotStatus status = ParkingSlot.SlotStatus.AVAILABLE;

    private Double pricePerHour = 5.0;
}

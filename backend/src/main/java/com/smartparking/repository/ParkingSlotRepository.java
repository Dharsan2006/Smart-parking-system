package com.smartparking.repository;

import com.smartparking.model.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    Optional<ParkingSlot> findBySlotNumber(String slotNumber);
    List<ParkingSlot> findByStatus(ParkingSlot.SlotStatus status);
    List<ParkingSlot> findByFloorNumber(Integer floorNumber);

    @Query("SELECT COUNT(p) FROM ParkingSlot p WHERE p.status = :status")
    long countByStatus(ParkingSlot.SlotStatus status);

    boolean existsBySlotNumber(String slotNumber);
}

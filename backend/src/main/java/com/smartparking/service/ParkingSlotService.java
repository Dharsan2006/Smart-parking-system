package com.smartparking.service;

import com.smartparking.dto.SlotRequest;
import com.smartparking.model.ParkingSlot;
import com.smartparking.repository.ParkingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkingSlotService {

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<ParkingSlot> getAllSlots() {
        return parkingSlotRepository.findAll();
    }

    public ParkingSlot getSlotById(Long id) {
        return parkingSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found with id: " + id));
    }

    public List<ParkingSlot> getAvailableSlots() {
        return parkingSlotRepository.findByStatus(ParkingSlot.SlotStatus.AVAILABLE);
    }

    public ParkingSlot createSlot(SlotRequest request) {
        if (parkingSlotRepository.existsBySlotNumber(request.getSlotNumber())) {
            throw new RuntimeException("Slot number already exists: " + request.getSlotNumber());
        }
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber(request.getSlotNumber());
        slot.setFloorNumber(request.getFloorNumber());
        slot.setSlotType(request.getSlotType());
        slot.setStatus(request.getStatus());
        slot.setPricePerHour(request.getPricePerHour());
        ParkingSlot saved = parkingSlotRepository.save(slot);
        broadcastSlotUpdate();
        return saved;
    }

    public ParkingSlot updateSlot(Long id, SlotRequest request) {
        ParkingSlot slot = getSlotById(id);
        slot.setSlotNumber(request.getSlotNumber());
        slot.setFloorNumber(request.getFloorNumber());
        slot.setSlotType(request.getSlotType());
        slot.setStatus(request.getStatus());
        slot.setPricePerHour(request.getPricePerHour());
        ParkingSlot saved = parkingSlotRepository.save(slot);
        broadcastSlotUpdate();
        return saved;
    }

    public void deleteSlot(Long id) {
        parkingSlotRepository.deleteById(id);
        broadcastSlotUpdate();
    }

    public ParkingSlot updateSlotStatus(Long id, ParkingSlot.SlotStatus status) {
        ParkingSlot slot = getSlotById(id);
        slot.setStatus(status);
        ParkingSlot saved = parkingSlotRepository.save(slot);
        broadcastSlotUpdate();
        return saved;
    }

    public void broadcastSlotUpdate() {
        List<ParkingSlot> slots = getAllSlots();
        messagingTemplate.convertAndSend("/topic/slots", slots);
    }
}

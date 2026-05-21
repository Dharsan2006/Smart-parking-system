package com.smartparking.config;

import com.smartparking.model.ParkingSlot;
import com.smartparking.model.User;
import com.smartparking.repository.ParkingSlotRepository;
import com.smartparking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin user
        if (!userRepository.existsByEmail("admin@smartpark.com")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@smartpark.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPhone("+1-000-000-0000");
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("✓ Admin user created: admin@smartpark.com / admin123");
        }

        // Create demo user
        if (!userRepository.existsByEmail("user@smartpark.com")) {
            User user = new User();
            user.setName("Demo User");
            user.setEmail("user@smartpark.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setPhone("+1-111-111-1111");
            user.setRole(User.Role.USER);
            userRepository.save(user);
            System.out.println("✓ Demo user created: user@smartpark.com / user123");
        }

        // Create parking slots if none exist
        if (parkingSlotRepository.count() == 0) {
            List<ParkingSlot> slots = new ArrayList<>();

            // Floor 1: A01-A20
            String[] floor1Types = {"REGULAR","REGULAR","COMPACT","COMPACT","HANDICAPPED",
                                    "REGULAR","REGULAR","REGULAR","REGULAR","REGULAR",
                                    "EV_CHARGING","EV_CHARGING","REGULAR","REGULAR","REGULAR",
                                    "COMPACT","COMPACT","REGULAR","REGULAR","REGULAR"};
            for (int i = 1; i <= 20; i++) {
                ParkingSlot slot = new ParkingSlot();
                slot.setSlotNumber(String.format("A%02d", i));
                slot.setFloorNumber(1);
                slot.setSlotType(ParkingSlot.SlotType.valueOf(floor1Types[i-1]));
                slot.setStatus(ParkingSlot.SlotStatus.AVAILABLE);
                slot.setPricePerHour(getPrice(floor1Types[i-1]));
                slots.add(slot);
            }

            // Floor 2: B01-B20
            for (int i = 1; i <= 20; i++) {
                ParkingSlot slot = new ParkingSlot();
                slot.setSlotNumber(String.format("B%02d", i));
                slot.setFloorNumber(2);
                slot.setSlotType(i <= 4 ? ParkingSlot.SlotType.COMPACT : ParkingSlot.SlotType.REGULAR);
                slot.setStatus(ParkingSlot.SlotStatus.AVAILABLE);
                slot.setPricePerHour(i <= 4 ? 4.0 : 5.0);
                slots.add(slot);
            }

            // Floor 3: C01-C10
            for (int i = 1; i <= 10; i++) {
                ParkingSlot slot = new ParkingSlot();
                slot.setSlotNumber(String.format("C%02d", i));
                slot.setFloorNumber(3);
                slot.setSlotType(ParkingSlot.SlotType.REGULAR);
                slot.setStatus(ParkingSlot.SlotStatus.AVAILABLE);
                slot.setPricePerHour(6.0);
                slots.add(slot);
            }

            parkingSlotRepository.saveAll(slots);
            System.out.println("✓ Created " + slots.size() + " parking slots across 3 floors");
        }
    }

    private double getPrice(String type) {
        return switch (type) {
            case "COMPACT" -> 4.0;
            case "HANDICAPPED" -> 3.0;
            case "EV_CHARGING" -> 8.0;
            default -> 5.0;
        };
    }
}

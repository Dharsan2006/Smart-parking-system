package com.smartparking.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BookingRequestTest {

    @Test
    void testDeserializeIsoDateTime() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        String jsonWithZ = "{\"slotId\":1,\"startTime\":\"2026-10-14T09:00:00.000Z\",\"endTime\":\"2026-10-14T10:00:00.000Z\",\"vehicleNumber\":\"ABC-1234\"}";
        BookingRequest request = mapper.readValue(jsonWithZ, BookingRequest.class);
        assertNotNull(request.getStartTime());
        assertNotNull(request.getEndTime());
    }
}

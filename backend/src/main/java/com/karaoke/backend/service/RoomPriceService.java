package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.WeeklyPriceRequest;
import com.karaoke.backend.dto.response.RoomPricingResponse;

import java.util.List;

public interface RoomPriceService {
    void updateWeeklyPrices(Integer roomId, List<WeeklyPriceRequest> requests);
    RoomPricingResponse getWeeklyPricing();
    void updateTimeSlots(List<com.karaoke.backend.dto.request.TimeSlotUpdateRequest> requests);
}

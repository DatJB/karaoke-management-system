package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.RoomPriceSpecialRequest;
import com.karaoke.backend.dto.response.RoomPriceSpecialResponse;

import java.util.List;

public interface RoomPriceSpecialService {
    List<RoomPriceSpecialResponse> addSpecialPrices(Integer roomId, List<RoomPriceSpecialRequest> requests);
    List<RoomPriceSpecialResponse> getSpecialPricesByRoom(Integer roomId);
    RoomPriceSpecialResponse updateSpecialPrice(Integer id, RoomPriceSpecialRequest request);
    void deleteSpecialPrice(Integer id);
}

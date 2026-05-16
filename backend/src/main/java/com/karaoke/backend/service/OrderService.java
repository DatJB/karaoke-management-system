package com.karaoke.backend.service;

import com.karaoke.backend.dto.request.OrderRequest;
import com.karaoke.backend.dto.response.OrderItemResponse;

import java.util.List;

public interface OrderService {
    List<OrderItemResponse> getRoomOrders(Integer roomId);
    OrderItemResponse addOrder(Integer roomId, OrderRequest request);
    OrderItemResponse updateOrderItem(Integer roomId, Integer itemId, Integer quantity);
    void deleteOrderItem(Integer roomId, Integer itemId);
}

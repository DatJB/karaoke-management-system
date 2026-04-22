package com.karaoke.backend.service.impl;

import com.karaoke.backend.dto.request.OrderRequest;
import com.karaoke.backend.dto.response.OrderItemResponse;
import com.karaoke.backend.entity.*;
import com.karaoke.backend.exception.ResourceNotFoundException;
import com.karaoke.backend.repository.*;
import com.karaoke.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final BookingRepository bookingRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemResponse> getRoomOrders(Integer roomId) {
        Invoice invoice = getActiveInvoiceByRoom(roomId);
        return invoice.getItems().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderItemResponse addOrder(Integer roomId, OrderRequest request) {
        Invoice invoice = getActiveInvoiceByRoom(roomId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStock() < request.getQuantity()) {
            throw new IllegalStateException("Not enough stock for product: " + product.getName());
        }

        product.setStock(product.getStock() - request.getQuantity());
        productRepository.save(product);

        InvoiceItem item = invoice.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        if (item != null) {
            item.setQuantity(item.getQuantity() + request.getQuantity());
            item.setTotalPrice(item.getUnitPrice().multiply(new BigDecimal(item.getQuantity())));
        } else {
            item = InvoiceItem.builder()
                    .invoice(invoice)
                    .product(product)
                    .quantity(request.getQuantity())
                    .unitPrice(product.getPrice())
                    .totalPrice(product.getPrice().multiply(new BigDecimal(request.getQuantity())))
                    .build();
            invoice.getItems().add(item);
        }

        invoiceItemRepository.save(item);
        updateInvoiceTotals(invoice);
        
        return mapToResponse(item);
    }

    @Override
    @Transactional
    public OrderItemResponse updateOrderItem(Integer roomId, Integer itemId, Integer quantity) {
        Invoice invoice = getActiveInvoiceByRoom(roomId);
        InvoiceItem item = invoiceItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));

        if (!item.getInvoice().getId().equals(invoice.getId())) {
            throw new IllegalArgumentException("Item does not belong to this room's invoice");
        }

        Product product = item.getProduct();
        int diff = quantity - item.getQuantity();

        if (product.getStock() < diff) {
            throw new IllegalStateException("Not enough stock to increase quantity");
        }

        product.setStock(product.getStock() - diff);
        productRepository.save(product);

        item.setQuantity(quantity);
        item.setTotalPrice(item.getUnitPrice().multiply(new BigDecimal(quantity)));
        
        invoiceItemRepository.save(item);
        updateInvoiceTotals(invoice);

        return mapToResponse(item);
    }

    @Override
    @Transactional
    public void deleteOrderItem(Integer roomId, Integer itemId) {
        Invoice invoice = getActiveInvoiceByRoom(roomId);
        InvoiceItem item = invoiceItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));

        if (!item.getInvoice().getId().equals(invoice.getId())) {
            throw new IllegalArgumentException("Item does not belong to this room's invoice");
        }

        Product product = item.getProduct();
        product.setStock(product.getStock() + item.getQuantity());
        productRepository.save(product);

        invoice.getItems().remove(item);
        invoiceItemRepository.delete(item);
        updateInvoiceTotals(invoice);
    }

    private Invoice getActiveInvoiceByRoom(Integer roomId) {
        List<Booking> activeBookings = bookingRepository.findByRoomIdAndStatuses(roomId, Arrays.asList(Booking.BookingStatus.CHECKED_IN));
        if (activeBookings.isEmpty()) {
            throw new ResourceNotFoundException("No active booking found for room id: " + roomId);
        }
        Booking booking = activeBookings.get(0);
        if (booking.getInvoice() == null) {
            throw new ResourceNotFoundException("Invoice not found for the active booking");
        }
        return booking.getInvoice();
    }

    private void updateInvoiceTotals(Invoice invoice) {
        BigDecimal servicePrice = invoice.getItems().stream()
                .map(InvoiceItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        invoice.setServicePrice(servicePrice);

        BigDecimal total = invoice.getRoomPrice().add(servicePrice).subtract(invoice.getDiscount());
        invoice.setTotalPrice(total);
        
        invoiceRepository.save(invoice);
    }

    private OrderItemResponse mapToResponse(InvoiceItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}

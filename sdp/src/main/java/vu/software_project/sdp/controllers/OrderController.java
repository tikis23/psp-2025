package vu.software_project.sdp.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import vu.software_project.sdp.DTOs.orders.CreateOrderRequestDTO;
import vu.software_project.sdp.DTOs.orders.OrderDTO;
import vu.software_project.sdp.DTOs.orders.OrderAddItemRequestDTO;
import vu.software_project.sdp.services.OrderService;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequestDTO request) {
        if (request.getMerchantId() == null || request.getMerchantId().isEmpty()) {
            return ResponseEntity.badRequest().body("merchantId is required");
        }
        OrderDTO orderDTO = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(orderDTO);
    }

    @PostMapping("/{orderId}/items")
    public ResponseEntity<?> addItemToOrder(@PathVariable Long orderId, @RequestBody OrderAddItemRequestDTO request) {
        try {
            OrderDTO updatedOrder = orderService.addItemToOrder(orderId, request);
            return ResponseEntity.status(HttpStatus.OK).body(updatedOrder);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }
}

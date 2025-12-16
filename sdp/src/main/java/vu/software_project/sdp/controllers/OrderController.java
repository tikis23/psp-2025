package vu.software_project.sdp.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import vu.software_project.sdp.DTOs.orders.CreateOrderRequestDTO;
import vu.software_project.sdp.DTOs.orders.OrderDTO;
import vu.software_project.sdp.DTOs.orders.OrderInfoDTO;
import vu.software_project.sdp.entities.Order;
import vu.software_project.sdp.DTOs.orders.OrderAddItemRequestDTO;
import vu.software_project.sdp.services.OrderService;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequestDTO request) {
        if (request.getMerchantId() == null) {
            return ResponseEntity.badRequest().body("merchantId is required");
        }
        OrderDTO orderDTO = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(orderDTO);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long orderId, @RequestBody String status) {
        try {
            Order.Status orderStatus = Order.Status.valueOf(status.toUpperCase());
            OrderDTO updatedOrder = orderService.updateOrderStatus(orderId, orderStatus);
            return ResponseEntity.status(HttpStatus.OK).body(updatedOrder);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status value");
        }
    }

    @PutMapping("/{orderId}/items/{itemId}/quantity")
    public ResponseEntity<?> updateOrderItemQuantity(@PathVariable Long orderId, @PathVariable Long itemId, @RequestBody Long quantity) {
        try {
            OrderDTO updatedOrder = orderService.updateOrderItemQuantity(orderId, itemId, quantity);
            return ResponseEntity.status(HttpStatus.OK).body(updatedOrder);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @DeleteMapping("/{orderId}/items/{itemId}")
    public ResponseEntity<?> removeItemFromOrder(@PathVariable Long orderId, @PathVariable Long itemId) {
        try {
            OrderDTO updatedOrder = orderService.removeItemFromOrder(orderId, itemId);
            return ResponseEntity.status(HttpStatus.OK).body(updatedOrder);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
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

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        try {
            OrderDTO orderDTO = orderService.getOrderById(orderId);
            return ResponseEntity.status(HttpStatus.OK).body(orderDTO);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @GetMapping("/{merchantId}/all")
    public ResponseEntity<?> getAllOrders(@PathVariable Long merchantId) {
        try {
            List<OrderInfoDTO> orders = orderService.getAllOrders(merchantId);
            return ResponseEntity.status(HttpStatus.OK).body(orders);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }
}

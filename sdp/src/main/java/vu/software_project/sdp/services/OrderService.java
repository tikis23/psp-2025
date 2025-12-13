package vu.software_project.sdp.services;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vu.software_project.sdp.DTOs.orders.CreateOrderRequestDTO;
import vu.software_project.sdp.DTOs.orders.OrderDTO;
import vu.software_project.sdp.entities.Order;
import vu.software_project.sdp.repositories.OrderRepository;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;

    @Transactional
    public OrderDTO createOrder(CreateOrderRequestDTO request) {
        Order order = new Order();
        order.setMerchantId(request.getMerchantId());
        order.setStatus(Order.Status.OPEN);
        order = orderRepository.save(order);

        return OrderDTO.builder()
            .id(order.getId())
            .merchantId(order.getMerchantId())
            .status(order.getStatus())
            .subtotal(BigDecimal.ZERO)
            .taxAmount(BigDecimal.ZERO)
            .discountAmount(BigDecimal.ZERO)
            .total(BigDecimal.ZERO)
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .build();
    }

}

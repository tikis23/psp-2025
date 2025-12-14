package vu.software_project.sdp.services;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vu.software_project.sdp.DTOs.item.ItemResponseDTO;
import vu.software_project.sdp.DTOs.orders.CreateOrderRequestDTO;
import vu.software_project.sdp.DTOs.orders.OrderAddItemRequestDTO;
import vu.software_project.sdp.DTOs.orders.OrderDTO;
import vu.software_project.sdp.DTOs.orders.OrderInfoDTO;
import vu.software_project.sdp.DTOs.orders.OrderItemDTO;
import vu.software_project.sdp.DTOs.orders.OrderItemVariationDTO;
import vu.software_project.sdp.entities.Order;
import vu.software_project.sdp.entities.OrderItem;
import vu.software_project.sdp.entities.OrderItemVariation;
import vu.software_project.sdp.entities.ProductVariation;
import vu.software_project.sdp.repositories.OrderRepository;
import vu.software_project.sdp.repositories.ProductVariationRepository;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final ProductVariationRepository variationRepository;

    @Transactional
    public OrderDTO createOrder(CreateOrderRequestDTO request) {
        Order order = new Order();
        order.setMerchantId(request.getMerchantId());
        order.setStatus(Order.Status.OPEN);
        order = orderRepository.save(order);

        return mapToOrderDTO(order);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return mapToOrderDTO(order);
    }

    @Transactional(readOnly = true)
    public List<OrderInfoDTO> getAllOrders(Long merchantId) {
        List<Order> orders = orderRepository.findByMerchantId(merchantId);
        List<OrderInfoDTO> orderDTOs = orders.stream()
            .map(order -> {
                OrderInfoDTO dto = new OrderInfoDTO();
                dto.setId(order.getId());
                dto.setMerchantId(order.getMerchantId());
                dto.setStatus(order.getStatus());
                dto.setCreatedAt(order.getCreatedAt());
                dto.setUpdatedAt(order.getUpdatedAt());
                return dto;
            })
            .toList();

        return orderDTOs;
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, Order.Status status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(status);
        order.setUpdatedAt(OffsetDateTime.now());
        order = orderRepository.save(order);
        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderItemQuantity(Long orderId, Long itemId, Long quantity) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setUpdatedAt(OffsetDateTime.now());
        
        order.getItems().removeIf(item ->
            item.getId().equals(itemId) && quantity <= 0L
        );

        order.getItems().stream()
            .filter(item -> item.getId().equals(itemId))
            .findFirst()
            .ifPresent(item -> item.setQuantity(quantity));
        
        order = orderRepository.save(order);
        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO removeItemFromOrder(Long orderId, Long itemId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setUpdatedAt(OffsetDateTime.now());
        
        order.getItems().removeIf(item -> item.getId().equals(itemId));
        order = orderRepository.save(order);

        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO addItemToOrder(Long orderId, OrderAddItemRequestDTO request) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setUpdatedAt(OffsetDateTime.now());
        
        Long merchantId = order.getMerchantId();
        ItemResponseDTO item = productService.getProductById(request.getItemId(), merchantId);
     
        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setItemId(item.getId());
        // orderItem.setTaxRateId(item.getTaxRateId());
        orderItem.setTaxRateId(0L);
        orderItem.setPrice(item.getPrice());
        orderItem.setQuantity(request.getQuantity());

        if (null != request.getVariationId()) {
            ProductVariation variation = variationRepository.findById(request.getVariationId())
                .orElseThrow(() -> new IllegalArgumentException("Product variation not found"));
            
            OrderItemVariation itemVariation = new OrderItemVariation();
            itemVariation.setOrderItem(orderItem);
            itemVariation.setProductVariationId(variation.getId());
            itemVariation.setPriceOffset(variation.getPriceOffset());
            orderItem.getVariations().add(itemVariation);
        }
        
        order.getItems().add(orderItem);
        order = orderRepository.save(order);

        return mapToOrderDTO(order);
    }


    private OrderDTO mapToOrderDTO(Order order) {
        Long merchantId = order.getMerchantId();
        
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;

        for (OrderItem item : order.getItems()) {
            BigDecimal quantity = BigDecimal.valueOf(item.getQuantity());
            BigDecimal itemTotal = item.getPrice().multiply(quantity);

            for (OrderItemVariation variation : item.getVariations()) {
                itemTotal = itemTotal.add(variation.getPriceOffset().multiply(quantity));
            }
            subtotal = subtotal.add(itemTotal);
        }
        BigDecimal total = subtotal.add(taxAmount).subtract(discountAmount);

        List<OrderItemDTO> itemDTOs = order.getItems()
            .stream().sorted(Comparator.comparing(OrderItem::getCreatedAt))
            .map(item -> {
            List<OrderItemVariationDTO> variationDTOs = 
            item.getVariations().stream().map(variation -> 
                OrderItemVariationDTO.builder()
                    .id(variation.getId())
                    .name(variationRepository.findById(variation.getProductVariationId())
                        .map(ProductVariation::getName)
                        .orElse("Unknown Variation"))
                    .priceOffset(variation.getPriceOffset())
                    .build()
            ).toList();

            return OrderItemDTO.builder()
                .id(item.getId())
                .name(productService.getProductById(item.getItemId(), merchantId).getName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .variations(variationDTOs)
                .build();
        }).toList();

        return OrderDTO.builder()
            .id(order.getId())
            .merchantId(order.getMerchantId())
            .status(order.getStatus())
            .items(itemDTOs)
            .subtotal(subtotal)
            .taxAmount(taxAmount)
            .discountAmount(discountAmount)
            .total(total)
            .createdAt(order.getCreatedAt())
            .updatedAt(order.getUpdatedAt())
            .build();
    }
}

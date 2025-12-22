package vu.software_project.sdp.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import vu.software_project.sdp.DTOs.item.ItemResponseDTO;
import vu.software_project.sdp.DTOs.orders.*;
import vu.software_project.sdp.entities.*;
import vu.software_project.sdp.repositories.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final PaymentRepository paymentRepository;
    private final ProductVariationRepository variationRepository;
    private final TaxRateRepository taxRateRepository;
    private final DiscountRepository discountRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    @Transactional
    public OrderDTO createOrder(CreateOrderRequestDTO request, Long userId, Long merchantId) {
        Order order = new Order();
        order.setMerchantId(request.getMerchantId());
        order.setStatus(Order.Status.OPEN);
        order = orderRepository.save(order);

        auditService.logAction(
                userId,
                "order.created",
                "Order",
                order.getId(),
                merchantId,
                null,
                buildOrderAuditData(order)
        );

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
        return orders.stream()
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
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, Order.Status status, Long userId, Long merchantId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(order.getStatus().transitionTo(status));
        order.setUpdatedAt(OffsetDateTime.now());
        order = orderRepository.save(order);

        auditService.logAction(
                userId,
                "order.status_changed",
                "Order",
                order.getId(),
                merchantId,
                null,
                buildOrderAuditData(order)
        );

        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderItemQuantity(Long orderId, Long itemId, Long quantity, Long userId, Long merchantId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getStatus().equals(Order.Status.OPEN)) {
            throw new IllegalArgumentException("Cannot modify items of an order that is not OPEN");
        }

        order.getItems().removeIf(item -> item.getId().equals(itemId) && quantity <= 0L);
        order.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));

        calculateAndPersistDiscounts(order);
        order.setUpdatedAt(OffsetDateTime.now());
        order = orderRepository.save(order);

        auditService.logAction(
                userId,
                "order.updated",
                "Order",
                order.getId(),
                merchantId,
                null,
                buildOrderAuditData(order)
        );

        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO removeItemFromOrder(Long orderId, Long itemId, Long userId, Long merchantId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getStatus().equals(Order.Status.OPEN)) {
            throw new IllegalArgumentException("Cannot modify items of an order that is not OPEN");
        }

        order.getItems().removeIf(item -> item.getId().equals(itemId));
        calculateAndPersistDiscounts(order);
        order.setUpdatedAt(OffsetDateTime.now());
        order = orderRepository.save(order);

        auditService.logAction(
                userId,
                "order.updated",
                "Order",
                order.getId(),
                merchantId,
                null,
                buildOrderAuditData(order)
        );

        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO addItemToOrder(Long orderId, OrderAddItemRequestDTO request, Long userId, Long merchantId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getStatus().equals(Order.Status.OPEN)) {
            throw new IllegalArgumentException("Cannot modify items of an order that is not OPEN");
        }

        ItemResponseDTO item = productService.getProductById(request.getItemId(), merchantId);

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setItemId(item.getId());
        orderItem.setName(item.getName());
        orderItem.setPrice(item.getPrice());
        orderItem.setQuantity(request.getQuantity());

        if (item.getTaxRateId() != null) {
            Optional<TaxRate> rateOpt = taxRateRepository.findById(item.getTaxRateId());
            if (rateOpt.isPresent()) {
                orderItem.setTaxRateId(rateOpt.get().getId());
                orderItem.setAppliedTaxRate(rateOpt.get().getRate());
            }
        }

        if (request.getVariationId() != null) {
            ProductVariation variation = variationRepository.findById(request.getVariationId())
                    .orElseThrow(() -> new IllegalArgumentException("Product variation not found"));
            OrderItemVariation itemVariation = new OrderItemVariation();
            itemVariation.setOrderItem(orderItem);
            itemVariation.setProductVariationId(variation.getId());
            itemVariation.setName(variation.getName());
            itemVariation.setPriceOffset(variation.getPriceOffset());
            orderItem.getVariations().add(itemVariation);
        }

        order.getItems().add(orderItem);

        calculateAndPersistDiscounts(order);
        order.setUpdatedAt(OffsetDateTime.now());
        order = orderRepository.save(order);

        auditService.logAction(
                userId,
                "order.updated",
                "Order",
                order.getId(),
                merchantId,
                null,
                buildOrderAuditData(order)
        );

        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO applyOrderDiscount(Long orderId, String discountCode) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (discountCode == null || discountCode.trim().isEmpty()) {
            order.setDiscountId(null);
        } else {
            Discount discount = discountRepository.findByCodeAndMerchantId(discountCode, order.getMerchantId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid discount code"));

            if (!discount.isValid()) throw new IllegalArgumentException("Discount is not valid at this time");
            if (discount.getScope() != Discount.Scope.ORDER) {
                throw new IllegalArgumentException("This discount can only be applied to specific products");
            }

            order.setDiscountId(discount.getId());
        }

        calculateAndPersistDiscounts(order);
        order = orderRepository.save(order);
        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO applyItemDiscount(Long orderId, Long orderItemId, String discountCode) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        OrderItem item = order.getItems().stream()
                .filter(i -> i.getId().equals(orderItemId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

        if (discountCode == null || discountCode.trim().isEmpty()) {
            item.setDiscountId(null);
        } else {
            Discount discount = discountRepository.findByCodeAndMerchantId(discountCode, order.getMerchantId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid discount code"));

            if (!discount.isValid()) throw new IllegalArgumentException("Discount is not valid");
            if (discount.getScope() != Discount.Scope.PRODUCT) {
                throw new IllegalArgumentException("This code is an order-wide discount");
            }
            if (discount.getProductId() != null && !discount.getProductId().equals(item.getItemId())) {
                throw new IllegalArgumentException("This discount does not apply to this specific product");
            }

            item.setDiscountId(discount.getId());
        }

        calculateAndPersistDiscounts(order);
        order = orderRepository.save(order);
        return mapToOrderDTO(order);
    }

    private void calculateAndPersistDiscounts(Order order) {
        BigDecimal runningSubtotal = BigDecimal.ZERO;
        BigDecimal runningTax = BigDecimal.ZERO;

        for (OrderItem item : order.getItems()) {
            BigDecimal qty = BigDecimal.valueOf(item.getQuantity());
            BigDecimal basePrice = item.getPrice();
            for (OrderItemVariation v : item.getVariations()) {
                basePrice = basePrice.add(v.getPriceOffset());
            }
            BigDecimal lineGross = basePrice.multiply(qty);

            BigDecimal itemDiscountVal = BigDecimal.ZERO;
            if (item.getDiscountId() != null) {
                Optional<Discount> dOpt = discountRepository.findById(item.getDiscountId());
                if (dOpt.isPresent()) {
                    Discount d = dOpt.get();
                    if (d.getType() == Discount.Type.FIXED_AMOUNT) {
                        itemDiscountVal = d.getValue();
                    } else {
                        itemDiscountVal = lineGross.multiply(d.getValue())
                                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                    }
                }
            }
            if (itemDiscountVal.compareTo(lineGross) > 0) itemDiscountVal = lineGross;
            item.setAppliedDiscountAmount(itemDiscountVal);

            BigDecimal taxable = lineGross.subtract(itemDiscountVal);
            if (item.getAppliedTaxRate() != null) {
                BigDecimal tax = taxable.multiply(item.getAppliedTaxRate())
                        .setScale(2, RoundingMode.HALF_UP);
                runningTax = runningTax.add(tax);
            }
            runningSubtotal = runningSubtotal.add(taxable);
        }

        BigDecimal orderDiscountVal = BigDecimal.ZERO;
        if (order.getDiscountId() != null) {
            Optional<Discount> dOpt = discountRepository.findById(order.getDiscountId());
            if (dOpt.isPresent()) {
                Discount d = dOpt.get();
                BigDecimal totalBeforeDisc = runningSubtotal.add(runningTax);

                if (d.getType() == Discount.Type.FIXED_AMOUNT) {
                    orderDiscountVal = d.getValue();
                } else {
                    orderDiscountVal = totalBeforeDisc.multiply(d.getValue())
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                }

                if (orderDiscountVal.compareTo(totalBeforeDisc) > 0) orderDiscountVal = totalBeforeDisc;
            }
        }
        order.setAppliedDiscountAmount(orderDiscountVal);
    }

    public OrderCostInfoDTO calculateOrderCosts(Order order) {
        BigDecimal grossSubtotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;
        BigDecimal totalItemDiscounts = BigDecimal.ZERO;

        Map<String, BigDecimal> taxAccumulator = new HashMap<>();
        List<String> discountDetails = new ArrayList<>();

        for (OrderItem item : order.getItems()) {
            BigDecimal qty = BigDecimal.valueOf(item.getQuantity());
            BigDecimal base = item.getPrice();
            for (OrderItemVariation v : item.getVariations()) {
                base = base.add(v.getPriceOffset());
            }
            BigDecimal lineGross = base.multiply(qty);

            grossSubtotal = grossSubtotal.add(lineGross);

            BigDecimal lineDisc = item.getAppliedDiscountAmount();
            if (lineDisc == null) {
                lineDisc = BigDecimal.ZERO;
            }
            totalItemDiscounts = totalItemDiscounts.add(lineDisc);

            BigDecimal taxable = lineGross.subtract(lineDisc);

            if (item.getAppliedTaxRate() != null) {
                BigDecimal t = taxable.multiply(item.getAppliedTaxRate());
                taxAmount = taxAmount.add(t);

                String key = item.getTaxRateId() != null ? item.getTaxRateId() : "unknown";
                taxAccumulator.put(key, taxAccumulator.getOrDefault(key, BigDecimal.ZERO).add(t));
            }

            if (lineDisc.compareTo(BigDecimal.ZERO) > 0 && item.getDiscountId() != null) {
                discountRepository.findById(item.getDiscountId()).ifPresent(d -> {
                    String desc = d.getType() == Discount.Type.PERCENTAGE
                            ? String.format("%s (%.0f%% on %s): -%s", d.getCode(), d.getValue(), item.getName(), item.getAppliedDiscountAmount())
                            : String.format("%s (Flat on %s): -%s", d.getCode(), item.getName(), item.getAppliedDiscountAmount());
                    discountDetails.add(desc);
                });
            }
        }

        BigDecimal orderDiscount = order.getAppliedDiscountAmount();
        if (orderDiscount == null) {
            orderDiscount = BigDecimal.ZERO;
        }

        if (orderDiscount.compareTo(BigDecimal.ZERO) > 0 && order.getDiscountId() != null) {
            discountRepository.findById(order.getDiscountId()).ifPresent(d -> {
                String desc = d.getType() == Discount.Type.PERCENTAGE
                        ? String.format("%s (%.0f%% on Order): -%s", d.getCode(), d.getValue(), order.getAppliedDiscountAmount())
                        : String.format("%s (Flat on Order): -%s", d.getCode(), order.getAppliedDiscountAmount());
                discountDetails.add(desc);
            });
        }

        BigDecimal totalDiscount = totalItemDiscounts.add(orderDiscount);

        BigDecimal total = grossSubtotal.subtract(totalDiscount).add(taxAmount);

        List<String> taxBreakdown = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : taxAccumulator.entrySet()) {
            String label = "Tax";
            BigDecimal rateVal = BigDecimal.ZERO;
            if (!"unknown".equals(entry.getKey())) {
                Optional<TaxRate> tr = taxRateRepository.findById(entry.getKey());
                if (tr.isPresent()) {
                    label = tr.get().getName();
                    rateVal = tr.get().getRate();
                }
            }
            String line = String.format("%s (%.0f%%): %s", label, rateVal.multiply(BigDecimal.valueOf(100)), entry.getValue().setScale(2, RoundingMode.HALF_UP));
            taxBreakdown.add(line);
        }

        return OrderCostInfoDTO.builder()
                .subtotal(grossSubtotal.setScale(2, RoundingMode.HALF_UP))
                .taxAmount(taxAmount.setScale(2, RoundingMode.HALF_UP))
                .discountAmount(totalDiscount.setScale(2, RoundingMode.HALF_UP))
                .total(total.setScale(2, RoundingMode.HALF_UP))
                .taxBreakdown(taxBreakdown)
                .discountBreakdown(discountDetails)
                .build();
    }

    private OrderDTO mapToOrderDTO(Order order) {
        OrderCostInfoDTO costInfo = calculateOrderCosts(order);

        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .sorted(Comparator.comparing(OrderItem::getCreatedAt))
                .map(item -> {
                    List<OrderItemVariationDTO> varDTOs = item.getVariations().stream()
                            .map(v -> OrderItemVariationDTO.builder()
                                    .id(v.getId())
                                    .name(v.getName())
                                    .priceOffset(v.getPriceOffset())
                                    .build())
                            .toList();

                    return OrderItemDTO.builder()
                            .id(item.getId())
                            .name(item.getName())
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .variations(varDTOs)
                            .appliedDiscountAmount(item.getAppliedDiscountAmount())
                            .build();
                }).toList();

        List<PaymentInfoDTO> paymentDTOs = paymentRepository.findByOrderId(order.getId()).stream()
                .map(p -> PaymentInfoDTO.builder()
                        .id(p.getId())
                        .type(p.getPaymentType())
                        .status(p.getStatus())
                        .amount(p.getAmount())
                        .cashReceived(p.getCashReceived())
                        .tip(p.getTip())
                        .build())
                .toList();

        return OrderDTO.builder()
                .id(order.getId())
                .merchantId(order.getMerchantId())
                .status(order.getStatus())
                .items(itemDTOs)
                .payments(paymentDTOs)
                .subtotal(costInfo.getSubtotal())
                .taxAmount(costInfo.getTaxAmount())
                .discountAmount(costInfo.getDiscountAmount())
                .discountId(order.getDiscountId())
                .total(costInfo.getTotal())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .taxBreakdown(costInfo.getTaxBreakdown())
                .discountBreakdown(costInfo.getDiscountBreakdown())
                .build();
    }

    private Map buildOrderAuditData(Order order) {
        return objectMapper.convertValue(order, Map.class);
    }

}
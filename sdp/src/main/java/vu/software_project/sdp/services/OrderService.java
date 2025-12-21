package vu.software_project.sdp.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

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
    public OrderDTO updateOrderStatus(Long orderId, Order.Status status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setStatus(order.getStatus().transitionTo(status));
        order.setUpdatedAt(OffsetDateTime.now());
        order = orderRepository.save(order);
        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderItemQuantity(Long orderId, Long itemId, Long quantity) {
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
        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO removeItemFromOrder(Long orderId, Long itemId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getStatus().equals(Order.Status.OPEN)) {
            throw new IllegalArgumentException("Cannot modify items of an order that is not OPEN");
        }

        order.getItems().removeIf(item -> item.getId().equals(itemId));
        calculateAndPersistDiscounts(order);
        order.setUpdatedAt(OffsetDateTime.now());
        order = orderRepository.save(order);
        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO addItemToOrder(Long orderId, OrderAddItemRequestDTO request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.getStatus().equals(Order.Status.OPEN)) {
            throw new IllegalArgumentException("Cannot modify items of an order that is not OPEN");
        }

        Long merchantId = order.getMerchantId();
        ItemResponseDTO item = productService.getProductById(request.getItemId(), merchantId);

        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setItemId(item.getId());
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
            itemVariation.setPriceOffset(variation.getPriceOffset());
            orderItem.getVariations().add(itemVariation);
        }

        order.getItems().add(orderItem);

        calculateAndPersistDiscounts(order);
        order.setUpdatedAt(OffsetDateTime.now());
        order = orderRepository.save(order);

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

    private OrderDTO mapToOrderDTO(Order order) {
        Long merchantId = order.getMerchantId();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxAmount = BigDecimal.ZERO;

        for (OrderItem item : order.getItems()) {
            BigDecimal qty = BigDecimal.valueOf(item.getQuantity());
            BigDecimal base = item.getPrice();
            for (OrderItemVariation v : item.getVariations()) {
                base = base.add(v.getPriceOffset());
            }
            BigDecimal lineGross = base.multiply(qty);
            BigDecimal lineDisc = item.getAppliedDiscountAmount();
            BigDecimal taxable = lineGross.subtract(lineDisc);

            subtotal = subtotal.add(taxable);
            if (item.getAppliedTaxRate() != null) {
                taxAmount = taxAmount.add(taxable.multiply(item.getAppliedTaxRate()));
            }
        }

        BigDecimal orderDiscount = order.getAppliedDiscountAmount();
        BigDecimal total = subtotal.add(taxAmount).subtract(orderDiscount);

        List<OrderItemDTO> itemDTOs = order.getItems().stream()
                .sorted(Comparator.comparing(OrderItem::getCreatedAt))
                .map(item -> {
                    List<OrderItemVariationDTO> varDTOs = item.getVariations().stream()
                            .map(v -> OrderItemVariationDTO.builder()
                                    .id(v.getId())
                                    .name(variationRepository.findById(v.getProductVariationId())
                                            .map(ProductVariation::getName).orElse("Variation"))
                                    .priceOffset(v.getPriceOffset())
                                    .build())
                            .toList();

                    return OrderItemDTO.builder()
                            .id(item.getId())
                            .name(productService.getProductById(item.getItemId(), merchantId).getName())
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
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .discountAmount(orderDiscount)
                .total(total.setScale(2, RoundingMode.HALF_UP))
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
package vu.software_project.sdp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vu.software_project.sdp.DTOs.payments.PaymentRequestDTO;
import vu.software_project.sdp.DTOs.payments.cash.CashPaymentResponseDTO;
import vu.software_project.sdp.DTOs.payments.giftcard.GiftCardPaymentResponseDTO;
import vu.software_project.sdp.entities.GiftCard;
import vu.software_project.sdp.entities.Order;
import vu.software_project.sdp.entities.Payment;
import vu.software_project.sdp.entities.Payment.PaymentType;
import vu.software_project.sdp.entities.Payment.Status;
import vu.software_project.sdp.repositories.OrderRepository;
import vu.software_project.sdp.repositories.PaymentRepository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final GiftCardService giftCardService;
    private final OrderRepository orderRepository;

    @Transactional
    public CashPaymentResponseDTO createCashPayment(Long orderId, PaymentRequestDTO request) {
        if (request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        Order order = loadOrder(orderId);

        BigDecimal total = calculateOrderTotal(order);
        BigDecimal alreadyPaid = calculatePaidAmount(orderId);
        BigDecimal remainingBefore = maxZero(total.subtract(alreadyPaid));

        if (remainingBefore.signum() == 0) {
            throw new IllegalArgumentException("Order is already fully paid");
        }

        BigDecimal amountReceived = request.getAmount();
        BigDecimal amountApplied = amountReceived.min(remainingBefore);
        BigDecimal changeDue = amountReceived.subtract(amountApplied);

        OffsetDateTime now = OffsetDateTime.now();

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setPaymentType(PaymentType.CASH);
        payment.setAmount(amountApplied);
        payment.setTip(request.getTip() != null ? request.getTip() : BigDecimal.ZERO);
        payment.setStatus(Status.SUCCEEDED);
        payment.setCreatedAt(now);
        payment.setUpdatedAt(now);

        payment = paymentRepository.save(payment);

        BigDecimal remainingAfter = remainingBefore.subtract(amountApplied);

        closeOrderIfPaid(order, remainingAfter);

        return CashPaymentResponseDTO.builder()
                .id("pay_" + payment.getId())
                .orderId(orderId.toString())
                .paymentType("CASH")
                .amount(payment.getAmount())
                .status(payment.getStatus().name().toLowerCase())
                .createdAt(payment.getCreatedAt())
                .remainingBalance(remainingAfter)
                .tip(payment.getTip())
                .changeDue(changeDue)
                .build();
    }

    @Transactional
    public GiftCardPaymentResponseDTO createGiftCardPayment(Long orderId, PaymentRequestDTO request) {
        if (request.getGiftCardCode() == null || request.getGiftCardCode().isBlank()) {
            throw new IllegalArgumentException("Gift card code is required");
        }

        Order order = loadOrder(orderId);

        BigDecimal total = calculateOrderTotal(order);
        BigDecimal alreadyPaid = calculatePaidAmount(orderId);
        BigDecimal remainingBefore = maxZero(total.subtract(alreadyPaid));

        if (remainingBefore.signum() == 0) {
            throw new IllegalArgumentException("Order is already fully paid");
        }

        BigDecimal amountToCharge = remainingBefore;

        GiftCard card = giftCardService.deduct(
                request.getGiftCardCode().trim(),
                amountToCharge
        );

        OffsetDateTime now = OffsetDateTime.now();

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setPaymentType(PaymentType.GIFT_CARD);
        payment.setAmount(amountToCharge);
        payment.setTip(BigDecimal.ZERO);
        payment.setStatus(Status.SUCCEEDED);
        payment.setCreatedAt(now);
        payment.setUpdatedAt(now);

        payment = paymentRepository.save(payment);

        BigDecimal remainingAfter = BigDecimal.ZERO;

        closeOrderIfPaid(order, remainingAfter);

        return GiftCardPaymentResponseDTO.builder()
                .id("pay_" + payment.getId())
                .orderId(orderId.toString())
                .paymentType("GIFT_CARD")
                .amount(payment.getAmount())
                .status(payment.getStatus().name().toLowerCase())
                .createdAt(payment.getCreatedAt())
                .remainingBalance(remainingAfter)
                .tip(BigDecimal.ZERO)
                .changeDue(BigDecimal.ZERO)
                .giftCardCode(card.getCode())
                .remainingCardBalance(card.getCurrentBalance())
                .build();
    }

    private Order loadOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
    }


    private BigDecimal calculateOrderTotal(Order order) {
        BigDecimal subtotal = BigDecimal.ZERO;

        for (var item : order.getItems()) {
            BigDecimal qty = BigDecimal.valueOf(item.getQuantity());
            BigDecimal itemTotal = item.getPrice().multiply(qty);

            for (var variation : item.getVariations()) {
                itemTotal = itemTotal.add(variation.getPriceOffset().multiply(qty));
            }
            subtotal = subtotal.add(itemTotal);
        }

        return subtotal;
    }

    private BigDecimal calculatePaidAmount(Long orderId) {
        return paymentRepository.findByOrderId(orderId).stream()
                .filter(p -> p.getStatus() == Status.SUCCEEDED)
                .map(Payment::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal maxZero(BigDecimal x) {
        return x.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : x;
    }

    private void closeOrderIfPaid(Order order, BigDecimal remainingAfter) {
        if (remainingAfter.signum() == 0 && order.getStatus() == Order.Status.OPEN) {
            order.setStatus(Order.Status.PAID);
            orderRepository.save(order);
        }
    }
}

package vu.software_project.sdp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stripe.param.RefundCreateParams;

import vu.software_project.sdp.DTOs.refunds.*;
import vu.software_project.sdp.entities.*;
import vu.software_project.sdp.repositories.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RefundService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;

    @Transactional
    public RefundResponseDTO createFullRefund(Long orderId, String reason) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("ORDER_NOT_FOUND"));

        if (order.getStatus() == Order.Status.REFUNDED) {
            throw new IllegalStateException("ORDER_ALREADY_REFUNDED");
        }

        if (order.getStatus() != Order.Status.PAID) {
            throw new IllegalStateException("ORDER_NOT_PAID");
        }

        List<Payment> payments = paymentRepository.findByOrderId(orderId);

        BigDecimal totalRefund = BigDecimal.ZERO;
        List<RefundBreakdownDTO> breakdown = new ArrayList<>();

        for (Payment payment : payments) {

            if (payment.getStatus() != Payment.Status.SUCCEEDED)
                continue;
            if (payment.getPaymentType() == Payment.PaymentType.GIFT_CARD)
                continue;

            String refundId = null;
            if (payment.getPaymentType() == Payment.PaymentType.CARD) {
                RefundCreateParams params =
                RefundCreateParams.builder()
                .setPaymentIntent(payment.getStripePaymentId())
                .setAmount(payment.getAmount().multiply(BigDecimal.valueOf(100)).longValue())
                .build();
                try {
                    com.stripe.model.Refund stripeRefund = com.stripe.model.Refund.create(params);
                    refundId = stripeRefund.getId();
                    payment.setStatus(Payment.Status.REFUNDED);
                } catch (Exception e) {
                    System.out.println("Failed to create stripe refund: " + e.getMessage());
                }
            } else {
                payment.setStatus(Payment.Status.REFUNDED);
            }

            payment.setUpdatedAt(OffsetDateTime.now());
            paymentRepository.save(payment);

            totalRefund = totalRefund.add(payment.getAmount());

            breakdown.add(RefundBreakdownDTO.builder()
                    .originalPaymentId("pay_" + payment.getId())
                    .paymentType(payment.getPaymentType().name().toLowerCase())
                    .amount(payment.getAmount())
                    .refundStatus(
                            payment.getStatus() == Payment.Status.REFUNDED
                                    ? "completed"
                                    : "failed"
                    )
                    .stripeRefundId(refundId)
                    .build());
        }

        if (totalRefund.signum() == 0) {
            throw new IllegalStateException("NO_REFUNDABLE_PAYMENTS");
        }

        Refund refund = new Refund();
        refund.setOrderId(orderId);
        refund.setTotalAmount(totalRefund);
        refund.setReason(reason);
        refund.setStatus(Refund.RefundStatus.PROCESSING);
        refund.setCreatedAt(OffsetDateTime.now());
        refundRepository.save(refund);

        order.setStatus(Order.Status.REFUNDED);
        orderRepository.save(order);

        return RefundResponseDTO.builder()
                .refundId("ref_" + refund.getId())
                .orderId(orderId.toString())
                .totalAmount(totalRefund)
                .status(refund.getStatus().name().toLowerCase())
                .createdAt(refund.getCreatedAt())
                .refundBreakdown(breakdown)
                .build();
    }
}
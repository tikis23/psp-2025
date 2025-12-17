package vu.software_project.sdp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

        if (order.getStatus() != Order.Status.PAID) {
            throw new IllegalStateException("ORDER_NOT_PAID");
        }

        if (order.getStatus() == Order.Status.REFUNDED) {
            throw new IllegalStateException("ORDER_ALREADY_REFUNDED");
        }

        List<Payment> payments = paymentRepository.findByOrderId(orderId);

        BigDecimal totalRefund = BigDecimal.ZERO;
        List<RefundBreakdownDTO> breakdown = new ArrayList<>();

        for (Payment payment : payments) {

            if (payment.getStatus() != Payment.Status.SUCCEEDED) continue;
            if (payment.getPaymentType() == Payment.PaymentType.GIFT_CARD) continue;

            payment.setStatus(Payment.Status.REFUNDED);
            payment.setUpdatedAt(OffsetDateTime.now());
            paymentRepository.save(payment);

            totalRefund = totalRefund.add(payment.getAmount());

            breakdown.add(RefundBreakdownDTO.builder()
                    .originalPaymentId("pay_" + payment.getId())
                    .paymentType(payment.getPaymentType().name().toLowerCase())
                    .amount(payment.getAmount())
                    .refundStatus(
                            payment.getPaymentType() == Payment.PaymentType.CARD
                                    ? "processing"
                                    : "completed"
                    )
                    .stripeRefundId(
                            payment.getPaymentType() == Payment.PaymentType.CARD
                                    ? "re_mocked"
                                    : null
                    )
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

    @Transactional(readOnly = true)
    public RefundResponseDTO getRefund(Long refundId) {

        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new IllegalArgumentException("REFUND_NOT_FOUND"));

        return RefundResponseDTO.builder()
                .refundId("ref_" + refund.getId())
                .orderId(refund.getOrderId().toString())
                .totalAmount(refund.getTotalAmount())
                .status(refund.getStatus().name().toLowerCase())
                .createdAt(refund.getCreatedAt())
                .refundBreakdown(List.of())
                .build();
    }
}
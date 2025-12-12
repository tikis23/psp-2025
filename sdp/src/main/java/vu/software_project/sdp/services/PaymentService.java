package vu.software_project.sdp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vu.software_project.sdp.DTOs.payments.*;
import vu.software_project.sdp.entities.GiftCard;
import vu.software_project.sdp.entities.Payment;
import vu.software_project.sdp.entities.Payment.PaymentType;
import vu.software_project.sdp.entities.Payment.Status;
import vu.software_project.sdp.repositories.PaymentRepository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final GiftCardService giftCardService;


    @Transactional
    public CashPaymentResponseDTO createCashPayment(Long orderId, PaymentRequestDTO request) {
        OffsetDateTime now = OffsetDateTime.now();

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setPaymentType(PaymentType.CASH);
        payment.setAmount(request.getAmount());
        payment.setStatus(Status.SUCCEEDED);
        payment.setCreatedAt(now);
        payment.setUpdatedAt(now);
        payment.setTip(request.getTip() != null ? request.getTip() : BigDecimal.ZERO);

        payment = paymentRepository.save(payment);

        BigDecimal remaining = BigDecimal.ZERO;

        return CashPaymentResponseDTO.builder()
                .id("pay_" + payment.getId())
                .orderId(orderId.toString())
                .paymentType("cash")
                .amount(payment.getAmount())
                .status(payment.getStatus().name().toLowerCase())
                .createdAt(payment.getCreatedAt())
                .remainingBalance(remaining)
                .tip(payment.getTip())
                .build();
    }


    @Transactional
    public GiftCardPaymentResponseDTO createGiftCardPayment(
            Long orderId,
            GiftCardPaymentRequestDTO request
    ) {
        GiftCard card = giftCardService.deduct(
                request.getGiftCardCode(),
                request.getAmount()
        );

        BigDecimal newCardBalance = card.getCurrentBalance();
        OffsetDateTime now = OffsetDateTime.now();

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setPaymentType(PaymentType.GIFT_CARD);
        payment.setAmount(request.getAmount());
        payment.setStatus(Status.SUCCEEDED);
        payment.setCreatedAt(now);
        payment.setUpdatedAt(now);
        payment.setTip(BigDecimal.ZERO);

        payment = paymentRepository.save(payment);

        return GiftCardPaymentResponseDTO.builder()
                .id("pay_" + payment.getId())
                .orderId(orderId.toString())
                .paymentType("gift_card")
                .amount(payment.getAmount())
                .status(payment.getStatus().name().toLowerCase())
                .createdAt(payment.getCreatedAt())
                .remainingBalance(BigDecimal.ZERO)
                .giftCardCode(card.getCode())
                .remainingCardBalance(newCardBalance)
                .build();
    }
}

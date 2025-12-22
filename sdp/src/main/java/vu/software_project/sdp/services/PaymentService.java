package vu.software_project.sdp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import vu.software_project.sdp.DTOs.orders.OrderCostInfoDTO;
import vu.software_project.sdp.DTOs.payments.PaymentRequestDTO;
import vu.software_project.sdp.DTOs.payments.card.CardPaymentResponseDTO;
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
    private final OrderService orderService;

    @Transactional
    public CashPaymentResponseDTO createCashPayment(Long orderId, PaymentRequestDTO request) {
        if (request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        Order order = loadOrder(orderId);

        OrderCostInfoDTO costInfo = orderService.calculateOrderCosts(order);
        BigDecimal total = costInfo.getTotal();
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
        payment.setCashReceived(amountReceived);
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
                .cashReceived(payment.getCashReceived())
                .status(payment.getStatus().name().toLowerCase())
                .createdAt(payment.getCreatedAt())
                .remainingBalance(remainingAfter)
                .tip(payment.getTip())
                .changeDue(changeDue)
                .build();
    }

    @Transactional
    public CardPaymentResponseDTO createCardPayment(Long orderId, PaymentRequestDTO request) {
        if (request.getAmount() == null || request.getAmount().signum() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        Order order = loadOrder(orderId);

        OrderCostInfoDTO costInfo = orderService.calculateOrderCosts(order);
        BigDecimal total = costInfo.getTotal();
        BigDecimal alreadyPaid = calculatePaidAmount(orderId);
        BigDecimal remainingBefore = maxZero(total.subtract(alreadyPaid));

        if (remainingBefore.signum() == 0) {
            throw new IllegalArgumentException("Order is already fully paid");
        }
        
        BigDecimal amountToPay = request.getAmount().min(remainingBefore);
        BigDecimal amountWithTips = amountToPay.add(request.getTip() != null ? request.getTip() : BigDecimal.ZERO);
        BigDecimal amountInCents = amountWithTips.multiply(new BigDecimal("100"));
        
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount(amountInCents.longValue())
            .setCurrency("usd")
            .build();
        
        PaymentIntent intent;
        try {
            intent = PaymentIntent.create(params);
        } catch (Exception e) {
            System.err.println("Stripe Payment Intent creation failed: " + e.getMessage());
            throw new RuntimeException("Failed to create card payment");
        }

        Payment payment = new Payment();
        try {
            OffsetDateTime now = OffsetDateTime.now();
            
            payment.setOrderId(orderId);
            payment.setStripePaymentId(intent.getId());
            payment.setPaymentType(PaymentType.CARD);
            payment.setAmount(amountToPay);
            payment.setCashReceived(BigDecimal.ZERO);
            payment.setTip(request.getTip() != null ? request.getTip() : BigDecimal.ZERO);
            payment.setStatus(Status.REQUIRES_ACTION);
            payment.setCreatedAt(now);
            payment.setUpdatedAt(now);
            
            payment = paymentRepository.save(payment);
        } catch (Exception e) {
            System.err.println("Payment record creation failed: " + e.getMessage());
            throw new RuntimeException("Failed to create card payment record");
        }

        return CardPaymentResponseDTO.builder()
            .paymentId(payment.getId().toString())
            .stripeClientSecret(intent.getClientSecret())
            .build();
    }

    @Transactional
    public void updateCardPaymentStatus(String stripePaymentId, Status newStatus) {
        Payment payment = paymentRepository.findByStripePaymentId(stripePaymentId);
        if (payment == null) {
            throw new IllegalArgumentException("Payment not found for Stripe Payment ID: " + stripePaymentId);
        }

        payment.setStatus(newStatus);
        payment.setUpdatedAt(OffsetDateTime.now());

        paymentRepository.save(payment);

        
        if (newStatus == Status.SUCCEEDED) {
            Order order = loadOrder(payment.getOrderId());
            OrderCostInfoDTO costInfo = orderService.calculateOrderCosts(order);
            BigDecimal total = costInfo.getTotal();
            BigDecimal alreadyPaid = calculatePaidAmount(order.getId());
            BigDecimal remainingAfter = maxZero(total.subtract(alreadyPaid));

            closeOrderIfPaid(order, remainingAfter);
        }
    }

    @Transactional
    public void cancelCardPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        
        if (payment.getPaymentType() != PaymentType.CARD) {
            throw new IllegalArgumentException("Only card payments can be canceled");
        }

        String paymentIntentId = payment.getStripePaymentId();
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new IllegalArgumentException("Payment does not have a valid Stripe Payment Intent ID");
        }

        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            intent.cancel();
        } catch (Exception e) {
            System.err.println("Failed to cancel Stripe Payment Intent: " + e.getMessage());
            throw new RuntimeException("Failed to cancel Stripe Payment.");
        }

        payment.setStatus(Status.CANCELED);
        payment.setUpdatedAt(OffsetDateTime.now());
        paymentRepository.save(payment);
    }

    @Transactional
    public GiftCardPaymentResponseDTO createGiftCardPayment(Long orderId, PaymentRequestDTO request) {
        if (request.getGiftCardCode() == null || request.getGiftCardCode().isBlank()) {
            throw new IllegalArgumentException("Gift card code is required");
        }

        Order order = loadOrder(orderId);

        OrderCostInfoDTO costInfo = orderService.calculateOrderCosts(order);
        BigDecimal total = costInfo.getTotal();
        BigDecimal alreadyPaid = calculatePaidAmount(orderId);
        BigDecimal remainingBefore = maxZero(total.subtract(alreadyPaid));

        Long merchantId = order.getMerchantId();
        String code = request.getGiftCardCode().trim();

        GiftCard before = giftCardService.getByCode(merchantId, code);

        if (!before.getActive()) {
            throw new IllegalStateException("GIFT_CARD_INACTIVE");
        }

        BigDecimal cardBalance = before.getCurrentBalance();
        if (cardBalance == null || cardBalance.signum() <= 0) {
            throw new IllegalArgumentException("INSUFFICIENT_GIFT_CARD_BALANCE");
        }

        BigDecimal amountToCharge = remainingBefore.min(cardBalance);

        GiftCard card = giftCardService.deduct(
                merchantId,
                code,
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

        BigDecimal remainingAfter = remainingBefore.subtract(amountToCharge);

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

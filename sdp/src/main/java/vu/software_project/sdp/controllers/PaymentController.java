package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.payments.*;
import vu.software_project.sdp.DTOs.payments.cash.CashPaymentResponseDTO;
import vu.software_project.sdp.DTOs.payments.giftcard.GiftCardPaymentRequestDTO;
import vu.software_project.sdp.DTOs.payments.giftcard.GiftCardPaymentResponseDTO;
import vu.software_project.sdp.services.PaymentService;

@RestController
@RequestMapping("/api/orders/{orderId}/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<?> createPayment(
            @PathVariable Long orderId,
            @RequestBody @NotNull PaymentRequestDTO request
    ) {
        String type = request.getPaymentType();
        if (type == null) {
            return ResponseEntity.badRequest()
                    .body("payment_type is required (cash, gift_card, ...)");
        }

        switch (type.toLowerCase()) {
            case "cash" -> {
                CashPaymentResponseDTO response =
                        paymentService.createCashPayment(orderId, request);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            }
            case "gift_card" -> {
                GiftCardPaymentRequestDTO gcReq = new GiftCardPaymentRequestDTO();
                gcReq.setAmount(request.getAmount());
                gcReq.setGiftCardCode(request.getGiftCardCode());

                GiftCardPaymentResponseDTO response =
                        paymentService.createGiftCardPayment(orderId, gcReq);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            }
            default -> {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Unsupported payment_type: " + type);
            }
        }
    }
}

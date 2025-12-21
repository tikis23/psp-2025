package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.payments.*;
import vu.software_project.sdp.services.PaymentService;

@RestController
@RequestMapping("/api/orders/{orderId}/pay")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<?> createPayment(
            @PathVariable Long orderId,
            @RequestBody @NotNull PaymentRequestDTO request) {
        String type = request.getPaymentType();
        if (type == null) {
            return ResponseEntity.badRequest().body("payment_type is required (CASH, GIFT_CARD, ...)");
        }

        return switch (type.toUpperCase()) {
            case "CASH" -> ResponseEntity.status(HttpStatus.CREATED)
                    .body(paymentService.createCashPayment(orderId, request));

            case "GIFT_CARD" -> ResponseEntity.status(HttpStatus.CREATED)
                    .body(paymentService.createGiftCardPayment(orderId, request));

            default -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Unsupported payment_type: " + type);
        };
    }
}

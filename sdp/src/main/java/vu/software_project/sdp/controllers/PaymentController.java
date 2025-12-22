package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.payments.*;
import vu.software_project.sdp.config.security.CustomUserDetails;
import vu.software_project.sdp.services.PaymentService;

@RestController
@RequestMapping("/api/orders/{orderId}/pay")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'BUSINESS_OWNER', 'EMPLOYEE')")
    public ResponseEntity<?> createPayment(
            @PathVariable Long orderId,
            @RequestBody @NotNull PaymentRequestDTO request,
            Authentication authentication
    ) {
        String type = request.getPaymentType();
        if (type == null) {
            return ResponseEntity.badRequest().body("payment_type is required (CASH, GIFT_CARD, CARD)");
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return switch (type.toUpperCase()) {
            case "CASH" -> ResponseEntity.status(HttpStatus.CREATED)
                    .body(paymentService.createCashPayment(orderId, request, userDetails.getId(), userDetails.getMerchantId()));

            case "CARD" -> ResponseEntity.status(HttpStatus.CREATED)
                    .body(paymentService.createCardPayment(orderId, request, userDetails.getId(), userDetails.getMerchantId()));

            case "GIFT_CARD" -> ResponseEntity.status(HttpStatus.CREATED)
                    .body(paymentService.createGiftCardPayment(orderId, request));

            default -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Unsupported payment_type: " + type);
        };
    }

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> cancelPayment(@PathVariable Long paymentId, Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            paymentService.cancelCardPayment(paymentId, userDetails.getMerchantId());
        } catch (Exception e) {
            System.out.println("Error cancelling payment: " + e.getMessage());
        }
        
        return ResponseEntity.noContent().build();
    }
}

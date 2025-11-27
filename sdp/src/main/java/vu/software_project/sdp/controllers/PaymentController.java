package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.payments.CashPaymentRequestDTO;
import vu.software_project.sdp.DTOs.payments.CashPaymentResponseDTO;
import vu.software_project.sdp.services.PaymentService;

@RestController
@RequestMapping("/api/orders/{orderId}/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<?> createPayment(
            @PathVariable Long orderId,
            @RequestBody CashPaymentRequestDTO request) {

        CashPaymentResponseDTO response = paymentService.createCashPayment(orderId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

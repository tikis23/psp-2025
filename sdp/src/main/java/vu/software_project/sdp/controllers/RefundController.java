package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.refunds.*;
import vu.software_project.sdp.services.RefundService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class RefundController {

    private final RefundService refundService;

    @PostMapping("/orders/{orderId}/refunds")
    public ResponseEntity<RefundResponseDTO> createRefund(
            @PathVariable Long orderId,
            @RequestBody CreateRefundRequestDTO request
    ) {
        RefundResponseDTO response =
                refundService.createFullRefund(orderId, request.getReason());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/refunds/{refundId}")
    public ResponseEntity<RefundResponseDTO> getRefund(
            @PathVariable Long refundId
    ) {
        return ResponseEntity.ok(refundService.getRefund(refundId));
    }
}

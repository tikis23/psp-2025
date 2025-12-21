package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.payments.giftcard.CreateGiftCardRequestDTO;
import vu.software_project.sdp.DTOs.payments.giftcard.GiftCardResponseDTO;
import vu.software_project.sdp.entities.GiftCard;
import vu.software_project.sdp.services.GiftCardService;

import java.util.List;

@RestController
@RequestMapping("/api/gift-cards")
@RequiredArgsConstructor
public class GiftCardController {

    private final GiftCardService giftCardService;

    @GetMapping
    public ResponseEntity<List<GiftCardResponseDTO>> listAll(
            @RequestParam Long merchantId
    ) {
        var data = giftCardService.getAll(merchantId)
                .stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(data);
    }

    @PostMapping
    public ResponseEntity<GiftCardResponseDTO> create(
            @RequestParam Long merchantId,
            @RequestBody CreateGiftCardRequestDTO request
    ) {
        GiftCard gc = giftCardService.createGiftCard(merchantId, request.getAmount());
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(gc));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> delete(
            @PathVariable String code,
            @RequestParam Long merchantId
    ) {
        giftCardService.deleteByCode(merchantId, code);
        return ResponseEntity.noContent().build();
    }

    private GiftCardResponseDTO toDto(GiftCard gc) {
        return GiftCardResponseDTO.builder()
                .code(gc.getCode())
                .initialBalance(gc.getInitialBalance())
                .currentBalance(gc.getCurrentBalance())
                .active(gc.getActive())
                .createdAt(gc.getCreatedAt())
                .expiryDate(gc.getExpiryDate())
                .build();
    }
}
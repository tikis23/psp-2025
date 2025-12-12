package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.payments.CreateGiftCardRequestDTO;
import vu.software_project.sdp.DTOs.payments.GiftCardResponseDTO;
import vu.software_project.sdp.entities.GiftCard;
import vu.software_project.sdp.services.GiftCardService;

@RestController
@RequestMapping("/api/gift-cards")
@RequiredArgsConstructor
public class GiftCardController {

    private final GiftCardService giftCardService;

    @PostMapping
    public ResponseEntity<GiftCardResponseDTO> createGiftCard(
            @RequestBody CreateGiftCardRequestDTO request
    ) {
        GiftCard card = giftCardService.createGiftCard(request.getAmount());

        GiftCardResponseDTO response = GiftCardResponseDTO.builder()
                .code(card.getCode())
                .balance(card.getCurrentBalance())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

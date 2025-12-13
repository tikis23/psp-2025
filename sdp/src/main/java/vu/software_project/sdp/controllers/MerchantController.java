package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.merchant.MerchantCreateRequestDTO;
import vu.software_project.sdp.DTOs.merchant.MerchantResponseDTO;
import vu.software_project.sdp.DTOs.merchant.MerchantUpdateRequestDTO;
import vu.software_project.sdp.services.MerchantService;
import java.util.List;

@RestController
@RequestMapping("/api/merchants")
@RequiredArgsConstructor
public class MerchantController {
    private final MerchantService merchantService;

    @PostMapping
    public ResponseEntity<MerchantResponseDTO> createMerchant(
            @RequestBody MerchantCreateRequestDTO request) {
        MerchantResponseDTO response = merchantService.createMerchant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MerchantResponseDTO> getMerchant(@PathVariable Long id) {
        MerchantResponseDTO response = merchantService.getMerchantById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MerchantResponseDTO>> getAllMerchants() {
        List<MerchantResponseDTO> response = merchantService.getAllMerchants();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MerchantResponseDTO> updateMerchant(
            @PathVariable Long id,
            @RequestBody MerchantUpdateRequestDTO request) {
        MerchantResponseDTO response = merchantService.updateMerchant(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMerchant(@PathVariable Long id) {
        merchantService.deleteMerchant(id);
        return ResponseEntity.noContent().build();
    }
}

package vu.software_project.sdp.controllers;

import vu.software_project.sdp.DTOs.merchant.MerchantCreateRequestDTO;
import vu.software_project.sdp.DTOs.merchant.MerchantResponseDTO;
import vu.software_project.sdp.DTOs.merchant.MerchantUpdateRequestDTO;
import vu.software_project.sdp.services.MerchantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/merchants")
public class MerchantController {
    private final MerchantService merchantService;

    public MerchantController(MerchantService merchantService) {
        this.merchantService = merchantService;
    }

    @PostMapping
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MerchantResponseDTO> createMerchant(
            @RequestBody MerchantCreateRequestDTO request,
            Authentication authentication) {
        // Extract current user ID from authentication
        Long userId = extractUserIdFromAuthentication(authentication);
        MerchantResponseDTO response = merchantService.createMerchant(request, userId);
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
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<MerchantResponseDTO> updateMerchant(
            @PathVariable Long id,
            @RequestBody MerchantUpdateRequestDTO request,
            Authentication authentication) {
        Long userId = extractUserIdFromAuthentication(authentication);
        MerchantResponseDTO response = merchantService.updateMerchant(id, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BUSINESS_OWNER')")
    public ResponseEntity<Void> deleteMerchant(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = extractUserIdFromAuthentication(authentication);
        merchantService.deleteMerchant(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserIdFromAuthentication(Authentication authentication) {
        // TODO: Extract User ID from authentication
        // Julius needs to clarify how to get user ID from SecurityContext
        // For now, placeholder implementation
        return 1L; // Placeholder
    }
}

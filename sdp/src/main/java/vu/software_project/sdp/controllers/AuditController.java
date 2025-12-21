package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import vu.software_project.sdp.DTOs.action_log.ActionLogResponse;
import vu.software_project.sdp.config.security.CustomUserDetails;
import vu.software_project.sdp.entities.User;
import vu.software_project.sdp.repositories.UserRepository;
import vu.software_project.sdp.services.AuditService;
import java.util.Objects;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;
    private final UserRepository userRepository;

    /**
     * Get action logs for a merchant (paginated)
     * Access: BUSINESS_OWNER (own merchant only), SUPER_ADMIN (all)
     */
    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'BUSINESS_OWNER')")
    public ResponseEntity<Page<ActionLogResponse>> getLogs(
            @RequestParam Long merchantId,
            @RequestParam(required = false) String actionType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        // Validate merchant access
        User currentUser = getCurrentUser(authentication);
        validateMerchantAccess(currentUser, merchantId);

        // Use snake_case column name for native queries
        Pageable pageable = PageRequest.of(page, size, Sort.by("created_at").descending());

        Page<ActionLogResponse> logs;
        if (actionType != null && !actionType.isEmpty()) {
            logs = auditService.getLogsByMerchantAndActionType(merchantId, actionType, pageable);
        } else {
            logs = auditService.getLogsByMerchant(merchantId, pageable);
        }

        return ResponseEntity.ok(logs);
    }

    /**
     * Get all logs (SUPER_ADMIN only)
     */
    @GetMapping("/logs/all")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Page<ActionLogResponse>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        // Method findAllByOrderByCreatedAtDesc already has ordering, no need for extra sort
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditService.getAllLogs(pageable));
    }

    // Helper methods
    private User getCurrentUser(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return userRepository.findByEmail(userDetails.getEmail())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
    }

    private void validateMerchantAccess(User user, Long merchantId) {
        // Super admin can access all merchants
        if (isSuperAdmin(user)) {
            return;
        }

        // Business Owner can only access their own business logs
        if (user.getRole() != User.Role.BUSINESS_OWNER || !Objects.equals(user.getMerchantId(), merchantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to merchant logs");
        }
    }

    private boolean isSuperAdmin(User user) {
        return user != null && user.getRole() == User.Role.SUPER_ADMIN;
    }

}

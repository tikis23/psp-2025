package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType; // Import needed for TEXT_PLAIN
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.reservations.ReservationCreateRequestDto;
import vu.software_project.sdp.DTOs.reservations.ReservationResponseDto;
import vu.software_project.sdp.services.ReservationService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<?> createReservation(
            @RequestBody ReservationCreateRequestDto request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(reservationService.createReservation(request, request.getMerchantId()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(ex.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReservation(
            @PathVariable Long id,
            @RequestBody ReservationCreateRequestDto request) {
        try {
            return ResponseEntity.ok(reservationService.updateReservation(id, request, request.getMerchantId()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponseDto>> getReservations(
            @RequestParam Long merchantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(reservationService.getAllReservations(merchantId, date));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelReservation(
            @PathVariable Long id,
            @RequestParam Long merchantId) {
        try {
            reservationService.cancelReservation(id, merchantId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(ex.getMessage());
        }
    }
}
package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.reservations.ReservationCreateRequestDto; // Updated import
import vu.software_project.sdp.DTOs.reservations.ReservationResponseDto;      // Updated import
import vu.software_project.sdp.services.ReservationService;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationResponseDto> createReservation(
            @RequestBody ReservationCreateRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createReservation(request, request.getMerchantId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponseDto> updateReservation(
            @PathVariable Long id,
            @RequestBody ReservationCreateRequestDto request) {
        return ResponseEntity.ok(reservationService.updateReservation(id, request, request.getMerchantId()));
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponseDto>> getReservations(
            @RequestParam Long merchantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(reservationService.getAllReservations(merchantId, date));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable Long id,
            @RequestParam Long merchantId) {
        reservationService.cancelReservation(id, merchantId);
        return ResponseEntity.noContent().build();
    }
}
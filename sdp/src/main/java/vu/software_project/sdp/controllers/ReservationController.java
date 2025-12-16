package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.reservation.ReservationCreateRequestDto;
import vu.software_project.sdp.DTOs.reservation.ReservationResponseDto;
import vu.software_project.sdp.services.ReservationService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // TODO: Get actual logged in user's merchant ID
    private Long getMerchantId() {
        return 1L;
    }

    @PostMapping
    public ResponseEntity<ReservationResponseDto> createReservation(
            @RequestBody ReservationCreateRequestDto request) {
        ReservationResponseDto response = reservationService.createReservation(request, getMerchantId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponseDto> updateReservation(
            @PathVariable Long id,
            @RequestBody ReservationCreateRequestDto request) {
        ReservationResponseDto response = reservationService.updateReservation(id, request, getMerchantId());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponseDto>> getReservations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(reservationService.getAllReservations(getMerchantId(), date));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
        reservationService.cancelReservation(id, getMerchantId());
        return ResponseEntity.noContent().build();
    }
}
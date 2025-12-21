package vu.software_project.sdp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vu.software_project.sdp.DTOs.reservation.ReservationCreateRequestDto;
import vu.software_project.sdp.DTOs.reservation.ReservationResponseDto;
import vu.software_project.sdp.entities.Reservation;
import vu.software_project.sdp.entities.Reservation.Status;
import vu.software_project.sdp.entities.ServiceItem;
import vu.software_project.sdp.repositories.ReservationRepository;
import vu.software_project.sdp.repositories.ServiceItemRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ServiceItemRepository serviceItemRepository;

    @Transactional
    public ReservationResponseDto createReservation(ReservationCreateRequestDto request, Long merchantId) {
        if (request.getAppointmentTime().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Cannot book appointments in the past");
        }

        String serviceName = "Unknown Service";

        // TODO: Will replace later - allowing invalid or dummy service ID for now
        if (request.getServiceId() != null) {
            serviceName = serviceItemRepository.findByIdAndMerchantId(request.getServiceId(), merchantId)
                    .map(ServiceItem::getName)
                    .orElse("Unknown Service");
        }

        Reservation reservation = new Reservation();
        reservation.setMerchantId(merchantId);
        reservation.setServiceId(request.getServiceId());
        reservation.setCustomerName(request.getCustomerName());
        reservation.setCustomerContact(request.getCustomerContact());
        reservation.setAppointmentTime(request.getAppointmentTime());
        reservation.setStatus(Status.CONFIRMED);

        Reservation saved = reservationRepository.save(reservation);

        return mapToDto(saved, serviceName);
    }

    @Transactional
    public ReservationResponseDto updateReservation(Long id, ReservationCreateRequestDto request, Long merchantId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        if (!reservation.getMerchantId().equals(merchantId)) {
            throw new IllegalArgumentException("Access Denied");
        }

        if (reservation.getStatus() != Status.CONFIRMED) {
            throw new IllegalArgumentException("Only confirmed reservations can be modified");
        }

        if (request.getAppointmentTime().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Cannot reschedule to the past");
        }

        String serviceName = "Unknown Service";
        if (request.getServiceId() != null) {
            serviceName = serviceItemRepository.findByIdAndMerchantId(request.getServiceId(), merchantId)
                    .map(ServiceItem::getName)
                    .orElse("Unknown Service");
        }

        reservation.setServiceId(request.getServiceId());
        reservation.setCustomerName(request.getCustomerName());
        reservation.setCustomerContact(request.getCustomerContact());
        reservation.setAppointmentTime(request.getAppointmentTime());

        Reservation updated = reservationRepository.save(reservation);
        return mapToDto(updated, serviceName);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getAllReservations(Long merchantId, LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        OffsetDateTime start = targetDate.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime end = targetDate.atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);

        return reservationRepository.findByMerchantIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(merchantId, start, end)
                .stream()
                .map(res -> {
                    String serviceName = "Unknown Service";
                    if (res.getServiceId() != null) {
                        serviceName = serviceItemRepository.findById(res.getServiceId())
                                .map(ServiceItem::getName)
                                .orElse("Unknown Service");
                    }
                    return mapToDto(res, serviceName);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelReservation(Long reservationId, Long merchantId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        if (!reservation.getMerchantId().equals(merchantId)) {
            throw new IllegalArgumentException("Access Denied");
        }

        reservation.setStatus(Status.CANCELLED);
        reservationRepository.save(reservation);
    }

    private ReservationResponseDto mapToDto(Reservation res, String serviceName) {
        return ReservationResponseDto.builder()
                .id(res.getId())
                .serviceId(res.getServiceId())
                .serviceName(serviceName)
                .customerName(res.getCustomerName())
                .customerContact(res.getCustomerContact())
                .appointmentTime(res.getAppointmentTime())
                .status(res.getStatus().name())
                .build();
    }
}
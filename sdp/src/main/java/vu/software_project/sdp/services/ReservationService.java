package vu.software_project.sdp.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vu.software_project.sdp.DTOs.reservations.ReservationCreateRequestDto;
import vu.software_project.sdp.DTOs.reservations.ReservationResponseDto;
import vu.software_project.sdp.entities.Reservation;
import vu.software_project.sdp.entities.Reservation.Status;
import vu.software_project.sdp.entities.ServiceItem;
import vu.software_project.sdp.entities.User;
import vu.software_project.sdp.repositories.ReservationRepository;
import vu.software_project.sdp.repositories.ServiceItemRepository;
import vu.software_project.sdp.repositories.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ServiceItemRepository serviceItemRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReservationResponseDto createReservation(ReservationCreateRequestDto request, Long merchantId) {
        if (request.getAppointmentTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot book appointments in the past");
        }

        List<Reservation> conflicts = reservationRepository.findByEmployeeIdAndAppointmentTimeAndStatus(
                request.getEmployeeId(),
                request.getAppointmentTime(),
                Status.CONFIRMED
        );
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Time slot already booked for this employee.");
        }

        Reservation reservation = new Reservation();
        reservation.setMerchantId(merchantId);
        reservation.setServiceId(request.getServiceId());
        reservation.setEmployeeId(request.getEmployeeId());
        reservation.setCustomerName(request.getCustomerName());
        reservation.setCustomerContact(request.getCustomerContact());
        reservation.setAppointmentTime(request.getAppointmentTime());
        reservation.setCreatedAt(LocalDateTime.now());
        reservation.setStatus(Status.CONFIRMED);

        Reservation saved = reservationRepository.save(reservation);

        return mapToDto(saved);
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

        List<Reservation> conflicts = reservationRepository.findByEmployeeIdAndAppointmentTimeAndStatus(
                request.getEmployeeId(),
                request.getAppointmentTime(),
                Status.CONFIRMED
        );

        boolean hasConflict = conflicts.stream().anyMatch(r -> !r.getId().equals(id));
        if (hasConflict) {
            throw new IllegalArgumentException("Time slot already booked for this employee.");
        }

        reservation.setServiceId(request.getServiceId());
        reservation.setEmployeeId(request.getEmployeeId());
        reservation.setCustomerName(request.getCustomerName());
        reservation.setCustomerContact(request.getCustomerContact());
        reservation.setAppointmentTime(request.getAppointmentTime());

        Reservation updated = reservationRepository.save(reservation);
        return mapToDto(updated);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponseDto> getAllReservations(Long merchantId, LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();

        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end = targetDate.atTime(LocalTime.MAX);

        return reservationRepository.findByMerchantIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(merchantId, start, end)
                .stream()
                .map(this::mapToDto)
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

    private ReservationResponseDto mapToDto(Reservation res) {
        String serviceName = serviceItemRepository.findById(res.getServiceId())
                .map(ServiceItem::getName)
                .orElse("Unknown Service");

        String employeeName = userRepository.findById(res.getEmployeeId())
                .map(User::getName)
                .orElse("Unknown Employee");

        return ReservationResponseDto.builder()
                .id(res.getId())
                .serviceId(res.getServiceId())
                .serviceName(serviceName)
                .employeeId(res.getEmployeeId())
                .employeeName(employeeName)
                .customerName(res.getCustomerName())
                .customerContact(res.getCustomerContact())
                .appointmentTime(res.getAppointmentTime())
                .bookedAt(res.getCreatedAt())
                .status(res.getStatus().name())
                .build();
    }
}
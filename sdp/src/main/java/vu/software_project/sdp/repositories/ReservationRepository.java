package vu.software_project.sdp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vu.software_project.sdp.entities.Reservation;
import vu.software_project.sdp.entities.Reservation.Status;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByMerchantIdOrderByAppointmentTimeAsc(Long merchantId);

    List<Reservation> findByMerchantIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(
            Long merchantId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Reservation> findByEmployeeIdAndAppointmentTimeAndStatus(
            Long employeeId,
            LocalDateTime appointmentTime,
            Status status
    );

    List<Reservation> findByEmployeeIdAndAppointmentTimeBetweenAndStatus(
            Long employeeId,
            LocalDateTime start,
            LocalDateTime end,
            Status status
    );
}
package vu.software_project.sdp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vu.software_project.sdp.entities.Reservation;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByMerchantIdOrderByAppointmentTimeAsc(Long merchantId);

    List<Reservation> findByMerchantIdAndAppointmentTimeBetweenOrderByAppointmentTimeAsc(
            Long merchantId,
            OffsetDateTime start,
            OffsetDateTime end
    );
}
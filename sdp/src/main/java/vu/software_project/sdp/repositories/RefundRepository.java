package vu.software_project.sdp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vu.software_project.sdp.entities.Refund;

import java.util.Optional;

public interface RefundRepository extends JpaRepository<Refund, Long> {
    Optional<Refund> findByOrderId(Long orderId);
}

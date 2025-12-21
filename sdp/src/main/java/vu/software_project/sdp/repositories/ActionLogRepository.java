package vu.software_project.sdp.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vu.software_project.sdp.entities.ActionLog;

@Repository
public interface ActionLogRepository extends JpaRepository<ActionLog, Long> {

    // Paginated queries
    @Query(
            value = "SELECT * FROM action_log ORDER BY created_at DESC",
            countQuery = "SELECT count(*) FROM action_log",
            nativeQuery = true
    )
    Page<ActionLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query(
            value = "SELECT * FROM action_log WHERE merchant_id = :merchantId ORDER BY created_at DESC",
            countQuery = "SELECT count(*) FROM action_log WHERE merchant_id = :merchantId",
            nativeQuery = true
    )
    Page<ActionLog> findByMerchantIdOrderByCreatedAtDesc(@Param("merchantId") Long merchantId, Pageable pageable);

    @Query(
            value = "SELECT * FROM action_log WHERE merchant_id = :merchantId AND action_type = :actionType ORDER BY created_at DESC",
            countQuery = "SELECT count(*) FROM action_log WHERE merchant_id = :merchantId AND action_type = :actionType",
            nativeQuery = true
    )
    Page<ActionLog> findByMerchantIdAndActionTypeOrderByCreatedAtDesc(@Param("merchantId") Long merchantId, @Param("actionType") String actionType, Pageable pageable);
}

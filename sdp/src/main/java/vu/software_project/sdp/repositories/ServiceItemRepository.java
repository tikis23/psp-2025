package vu.software_project.sdp.repositories;

import vu.software_project.sdp.entities.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findByMerchantId(Long merchantId);
    
    // Find service item only if it belongs to the specified merchant
    Optional<ServiceItem> findByIdAndMerchantId(Long id, Long merchantId);
    
    // Check if service item exists for the specified merchant
    boolean existsByIdAndMerchantId(Long id, Long merchantId);
}

package vu.software_project.sdp.repositories;

import vu.software_project.sdp.entities.ServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findByMerchantId(Long merchantId);
}

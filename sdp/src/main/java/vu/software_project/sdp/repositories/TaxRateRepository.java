package vu.software_project.sdp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vu.software_project.sdp.entities.TaxRate;
import java.util.List;

public interface TaxRateRepository extends JpaRepository<TaxRate, String> {
    List<TaxRate> findByMerchantId(Long merchantId);
}
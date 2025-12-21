package vu.software_project.sdp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vu.software_project.sdp.entities.Discount;
import java.util.List;
import java.util.Optional;

public interface DiscountRepository extends JpaRepository<Discount, String> {
    List<Discount> findByMerchantId(Long merchantId);
    Optional<Discount> findByCodeAndMerchantId(String code, Long merchantId);
}
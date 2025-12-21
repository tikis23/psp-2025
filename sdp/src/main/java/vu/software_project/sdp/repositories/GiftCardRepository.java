package vu.software_project.sdp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vu.software_project.sdp.entities.GiftCard;

import java.util.List;
import java.util.Optional;

public interface GiftCardRepository extends JpaRepository<GiftCard, String> {

    List<GiftCard> findAllByMerchantId(Long merchantId);

    Optional<GiftCard> findByCodeAndMerchantId(String code, Long merchantId);

    boolean existsByCodeAndMerchantId(String code, Long merchantId);
}

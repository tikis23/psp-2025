package vu.software_project.sdp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vu.software_project.sdp.entities.GiftCard;

import java.util.Optional;

public interface GiftCardRepository extends JpaRepository<GiftCard, String> {

    Optional<GiftCard> findByCode(String code);
}

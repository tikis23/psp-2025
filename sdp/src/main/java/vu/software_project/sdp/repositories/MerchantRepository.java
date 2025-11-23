package vu.software_project.sdp.repositories;

import vu.software_project.sdp.entities.Merchant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MerchantRepository extends JpaRepository<Merchant, Long> {
}

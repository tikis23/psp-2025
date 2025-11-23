package vu.software_project.sdp.repositories;

import vu.software_project.sdp.entities.ProductVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductVariationRepository extends JpaRepository<ProductVariation, Long> {
    List<ProductVariation> findByProductId(Long productId);
}

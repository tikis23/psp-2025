package vu.software_project.sdp.repositories;

import vu.software_project.sdp.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByMerchantId(Long merchantId);
    
    //  Find product only if it belongs to the specified merchant
    Optional<Product> findByIdAndMerchantId(Long id, Long merchantId);
    
    //  Check if product exists for the specified merchant
    boolean existsByIdAndMerchantId(Long id, Long merchantId);
}

package vu.software_project.sdp.repositories;

import vu.software_project.sdp.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByMerchantId(Long merchantId);
}

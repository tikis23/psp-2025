package vu.software_project.sdp.services;

import vu.software_project.sdp.DTOs.item.ItemCreateRequestDTO;
import vu.software_project.sdp.DTOs.item.ItemResponseDTO;
import vu.software_project.sdp.DTOs.item.ItemUpdateRequestDTO;
import vu.software_project.sdp.DTOs.item.ProductVariationResponseDTO;
import vu.software_project.sdp.entities.Product;
import vu.software_project.sdp.repositories.ProductRepository;
import vu.software_project.sdp.repositories.ProductVariationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductVariationRepository variationRepository;

    public ProductService(ProductRepository productRepository, ProductVariationRepository variationRepository) {
        this.productRepository = productRepository;
        this.variationRepository = variationRepository;
    }

    @Transactional
    public ItemResponseDTO createProduct(ItemCreateRequestDTO request, Long merchantId) {
        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setMerchantId(merchantId);
        product.setTaxRateId(request.getTaxRateId());

        Product saved = productRepository.save(product);
        return toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public ItemResponseDTO getProductById(Long id, Long merchantId) {
        Product product = productRepository.findByIdAndMerchantId(id, merchantId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Product not found or access denied"));
        return toResponseDTO(product);
    }

    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getProductsByMerchant(Long merchantId) {
        return productRepository.findByMerchantId(merchantId)
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public ItemResponseDTO updateProduct(Long id, ItemUpdateRequestDTO request, Long merchantId) {
        Product product = productRepository.findByIdAndMerchantId(id, merchantId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Product not found or access denied"));

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setTaxRateId(request.getTaxRateId());

        Product updated = productRepository.save(product);
        return toResponseDTO(updated);
    }

    @Transactional
    public void deleteProduct(Long id, Long merchantId) {
        if (!productRepository.existsByIdAndMerchantId(id, merchantId)) {
            throw new IllegalArgumentException("Product not found or access denied");
        }
        productRepository.deleteById(id);
    }

    private ItemResponseDTO toResponseDTO(Product product) {
        List<ProductVariationResponseDTO> variations = variationRepository.findByProductId(product.getId())
            .stream()
            .map(v -> new ProductVariationResponseDTO(v.getId(), v.getName(), v.getPriceOffset()))
            .collect(Collectors.toList());

        return new ItemResponseDTO(
            product.getId(),
            product.getName(),
            product.getPrice(),
            "PRODUCT",
            product.getTaxRateId(),
            variations
        );
    }
}

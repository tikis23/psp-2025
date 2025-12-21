package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.item.*;
import vu.software_project.sdp.entities.Product;
import vu.software_project.sdp.entities.ProductVariation;
import vu.software_project.sdp.repositories.ProductRepository;
import vu.software_project.sdp.repositories.ProductVariationRepository;
import vu.software_project.sdp.services.ProductService;
import vu.software_project.sdp.services.ServiceItemService;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {
    private final ProductService productService;
    private final ServiceItemService serviceItemService;
    private final ProductVariationRepository variationRepository;
    private final ProductRepository productRepository;

    @PostMapping
    public ResponseEntity<ItemResponseDTO> createItem(
            @RequestBody ItemCreateRequestDTO request,
            @RequestParam Long merchantId) {
        
        if ("PRODUCT".equalsIgnoreCase(request.getType())) {
            ItemResponseDTO response = productService.createProduct(request, merchantId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else if ("SERVICE_ITEM".equalsIgnoreCase(request.getType())) {
            ItemResponseDTO response = serviceItemService.createServiceItem(request, merchantId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
        throw new IllegalArgumentException("Invalid item type. Use 'PRODUCT' or 'SERVICE_ITEM'");
    }

    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getAllItems(@RequestParam Long merchantId) {
        List<ItemResponseDTO> products = productService.getProductsByMerchant(merchantId);
        List<ItemResponseDTO> services = serviceItemService.getServiceItemsByMerchant(merchantId);

        List<ItemResponseDTO> allItems = new ArrayList<>(products);
        allItems.addAll(services);

        return ResponseEntity.ok(allItems);
    }

    @GetMapping("/products")
    public ResponseEntity<List<ItemResponseDTO>> getAllProducts(@RequestParam Long merchantId) {
        List<ItemResponseDTO> products = productService.getProductsByMerchant(merchantId);
        return ResponseEntity.ok(products);
    }
     
    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDTO> getItem(
            @PathVariable Long id,
            @RequestParam Long merchantId) {
        
        try {
            ItemResponseDTO response = productService.getProductById(id, merchantId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ItemResponseDTO response = serviceItemService.getServiceItemById(id, merchantId);
            return ResponseEntity.ok(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponseDTO> updateItem(
            @PathVariable Long id,
            @RequestBody ItemUpdateRequestDTO request,
            @RequestParam Long merchantId) {
        
        try {
            ItemResponseDTO response = productService.updateProduct(id, request, merchantId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ItemResponseDTO response = serviceItemService.updateServiceItem(id, request, merchantId);
            return ResponseEntity.ok(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long id,
            @RequestParam Long merchantId) {
        
        try {
            productService.deleteProduct(id, merchantId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            serviceItemService.deleteServiceItem(id, merchantId);
            return ResponseEntity.noContent().build();
        }
    }

    // ========== PRODUCT VARIATION ENDPOINTS ==========
    
    @PostMapping("/{itemId}/variations")
    public ResponseEntity<ProductVariationResponseDTO> createVariation(
            @PathVariable Long itemId,
            @RequestBody ProductVariationCreateRequestDTO request,
            @RequestParam Long merchantId) {
        
        // Authorization check
        Product product = productRepository.findByIdAndMerchantId(itemId, merchantId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Product not found or access denied"));
        
        ProductVariation variation = new ProductVariation();
        variation.setProductId(itemId);
        variation.setName(request.getName());
        variation.setPriceOffset(request.getPriceOffset());

        ProductVariation saved = variationRepository.save(variation);
        ProductVariationResponseDTO response = new ProductVariationResponseDTO(
            saved.getId(),
            saved.getName(),
            saved.getPriceOffset()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{itemId}/variations")
    public ResponseEntity<List<ProductVariationResponseDTO>> getVariations(
            @PathVariable Long itemId,
            @RequestParam Long merchantId) {
        
        // Authorization check
        Product product = productRepository.findByIdAndMerchantId(itemId, merchantId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Product not found or access denied"));
        
        List<ProductVariationResponseDTO> variations = variationRepository.findByProductId(itemId)
            .stream()
            .map(v -> new ProductVariationResponseDTO(v.getId(), v.getName(), v.getPriceOffset()))
            .collect(Collectors.toList());

        return ResponseEntity.ok(variations);
    }

    @PutMapping("/{itemId}/variations/{variationId}")
    public ResponseEntity<ProductVariationResponseDTO> updateVariation(
            @PathVariable Long itemId,
            @PathVariable Long variationId,
            @RequestBody ProductVariationCreateRequestDTO request,
            @RequestParam Long merchantId) {
        
        // Authorization check
        Product product = productRepository.findByIdAndMerchantId(itemId, merchantId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Product not found or access denied"));
        
        ProductVariation variation = variationRepository.findById(variationId)
            .orElseThrow(() -> new IllegalArgumentException("Variation not found"));

        if (!variation.getProductId().equals(itemId)) {
            throw new IllegalArgumentException("Variation does not belong to this product");
        }

        variation.setName(request.getName());
        variation.setPriceOffset(request.getPriceOffset());

        ProductVariation updated = variationRepository.save(variation);
        ProductVariationResponseDTO response = new ProductVariationResponseDTO(
            updated.getId(),
            updated.getName(),
            updated.getPriceOffset()
        );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{itemId}/variations/{variationId}")
    public ResponseEntity<Void> deleteVariation(
            @PathVariable Long itemId,
            @PathVariable Long variationId,
            @RequestParam Long merchantId) {
        // Authorization check
        Product product = productRepository.findByIdAndMerchantId(itemId, merchantId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Product not found or access denied"));
        
        ProductVariation variation = variationRepository.findById(variationId)
            .orElseThrow(() -> new IllegalArgumentException("Variation not found"));

        if (!variation.getProductId().equals(itemId)) {
            throw new IllegalArgumentException("Variation does not belong to this product");
        }

        variationRepository.deleteById(variationId);
        return ResponseEntity.noContent().build();
    }
}

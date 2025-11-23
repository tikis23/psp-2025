package vu.software_project.sdp.controllers;

import vu.software_project.sdp.DTOs.item.*;
import vu.software_project.sdp.services.ProductService;
import vu.software_project.sdp.services.ServiceItemService;
import vu.software_project.sdp.repositories.ProductVariationRepository;
import vu.software_project.sdp.entities.ProductVariation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/items")
public class ItemController {
    private final ProductService productService;
    private final ServiceItemService serviceItemService;
    private final ProductVariationRepository variationRepository;

    public ItemController(ProductService productService, ServiceItemService serviceItemService, ProductVariationRepository variationRepository) {
        this.productService = productService;
        this.serviceItemService = serviceItemService;
        this.variationRepository = variationRepository;
    }

    // TODO: Get merchantId - need to determine how to scope items to current merchant
    private Long getMerchantId() {
        // Placeholder: return 1L for single merchant assumption
        return 1L;
    }

    @PostMapping
    public ResponseEntity<ItemResponseDTO> createItem(@RequestBody ItemCreateRequestDTO request) {
        Long merchantId = getMerchantId();

        if ("PRODUCT".equalsIgnoreCase(request.getType())) {
            ItemResponseDTO response = productService.createProduct(request, merchantId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else if ("SERVICE".equalsIgnoreCase(request.getType())) {
            ItemResponseDTO response = serviceItemService.createService(request, merchantId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            throw new IllegalArgumentException("Invalid item type");
        }
    }

    @GetMapping
    public ResponseEntity<List<ItemResponseDTO>> getAllItems() {
        Long merchantId = getMerchantId();

        List<ItemResponseDTO> products = productService.getProductsByMerchant(merchantId);
        List<ItemResponseDTO> services = serviceItemService.getServicesByMerchant(merchantId);

        List<ItemResponseDTO> allItems = products;
        allItems.addAll(services);

        return ResponseEntity.ok(allItems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDTO> getItem(@PathVariable Long id) {
        try {
            ItemResponseDTO response = productService.getProductById(id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ItemResponseDTO response = serviceItemService.getServiceById(id);
            return ResponseEntity.ok(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponseDTO> updateItem(@PathVariable Long id, @RequestBody ItemUpdateRequestDTO request) {
        try {
            ItemResponseDTO response = productService.updateProduct(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ItemResponseDTO response = serviceItemService.updateService(id, request);
            return ResponseEntity.ok(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            serviceItemService.deleteService(id);
            return ResponseEntity.noContent().build();
        }
    }

    @PostMapping("/{itemId}/variations")
    public ResponseEntity<ProductVariationResponseDTO> createVariation(
            @PathVariable Long itemId,
            @RequestBody ProductVariationCreateRequestDTO request) {
        ProductVariation variation = new ProductVariation();
        variation.setProductId(itemId);
        variation.setName(request.getName());
        variation.setPriceOffset(request.getPriceOffset());

        ProductVariation saved = variationRepository.save(variation);
        ProductVariationResponseDTO response = new ProductVariationResponseDTO(saved.getId(), saved.getName(), saved.getPriceOffset());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{itemId}/variations")
    public ResponseEntity<List<ProductVariationResponseDTO>> getVariations(@PathVariable Long itemId) {
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
            @RequestBody ProductVariationCreateRequestDTO request) {
        ProductVariation variation = variationRepository.findById(variationId)
            .orElseThrow(() -> new IllegalArgumentException("Variation not found"));

        variation.setName(request.getName());
        variation.setPriceOffset(request.getPriceOffset());

        ProductVariation updated = variationRepository.save(variation);
        ProductVariationResponseDTO response = new ProductVariationResponseDTO(updated.getId(), updated.getName(), updated.getPriceOffset());

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{itemId}/variations/{variationId}")
    public ResponseEntity<Void> deleteVariation(
            @PathVariable Long itemId,
            @PathVariable Long variationId) {
        if (!variationRepository.existsById(variationId)) {
            throw new IllegalArgumentException("Variation not found");
        }
        variationRepository.deleteById(variationId);
        return ResponseEntity.noContent().build();
    }
}


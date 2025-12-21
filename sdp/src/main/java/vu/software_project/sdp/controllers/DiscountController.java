package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.entities.Discount;
import vu.software_project.sdp.repositories.DiscountRepository;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
public class DiscountController {
    private final DiscountRepository discountRepository;

    @GetMapping
    public ResponseEntity<List<Discount>> getDiscounts(@RequestParam Long merchantId) {
        return ResponseEntity.ok(discountRepository.findByMerchantId(merchantId));
    }

    @PostMapping
    public ResponseEntity<Discount> createDiscount(@RequestBody Discount discount) {
        return ResponseEntity.ok(discountRepository.save(discount));
    }
}
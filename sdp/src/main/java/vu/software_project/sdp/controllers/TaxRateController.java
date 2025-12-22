package vu.software_project.sdp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.entities.TaxRate;
import vu.software_project.sdp.repositories.TaxRateRepository;
import java.util.List;

@RestController
@RequestMapping("/api/tax-rates")
@RequiredArgsConstructor
public class TaxRateController {
    private final TaxRateRepository taxRateRepository;

    @GetMapping
    public ResponseEntity<List<TaxRate>> getTaxRates(@RequestParam Long merchantId) {
        return ResponseEntity.ok(taxRateRepository.findByMerchantId(merchantId));
    }

    @PostMapping
    public ResponseEntity<TaxRate> createTaxRate(@RequestBody TaxRate taxRate) {
        return ResponseEntity.ok(taxRateRepository.save(taxRate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaxRate> updateTaxRate(@PathVariable String id, @RequestBody TaxRate taxRate) {
        if (!taxRateRepository.existsById(id)) return ResponseEntity.notFound().build();
        taxRate.setId(id);
        return ResponseEntity.ok(taxRateRepository.save(taxRate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTaxRate(@PathVariable String id) {
        taxRateRepository.findById(id).ifPresent(taxRate -> {
            taxRate.setActive(false);
            taxRateRepository.save(taxRate);
        });
        return ResponseEntity.noContent().build();
    }
}
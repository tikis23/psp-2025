package vu.software_project.sdp.services;

import vu.software_project.sdp.DTOs.merchant.MerchantCreateRequestDTO;
import vu.software_project.sdp.DTOs.merchant.MerchantResponseDTO;
import vu.software_project.sdp.DTOs.merchant.MerchantUpdateRequestDTO;
import vu.software_project.sdp.entities.Merchant;
import vu.software_project.sdp.repositories.MerchantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MerchantService {
    private final MerchantRepository merchantRepository;

    public MerchantService(MerchantRepository merchantRepository) {
        this.merchantRepository = merchantRepository;
    }

    @Transactional
    public MerchantResponseDTO createMerchant(MerchantCreateRequestDTO request) {
        Merchant merchant = new Merchant();
        merchant.setName(request.getName());
        merchant.setAddress(request.getAddress());
        merchant.setContactInfo(request.getContactInfo());
        // TODO: Julius will provide how to get current user ID
        merchant.setOwnerId(1L);

        Merchant saved = merchantRepository.save(merchant);
        return toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public MerchantResponseDTO getMerchantById(Long id) {
        Merchant merchant = merchantRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Merchant not found"));
        return toResponseDTO(merchant);
    }

    @Transactional(readOnly = true)
    public List<MerchantResponseDTO> getAllMerchants() {
        return merchantRepository.findAll()
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public MerchantResponseDTO updateMerchant(Long id, MerchantUpdateRequestDTO request) {
        Merchant merchant = merchantRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Merchant not found"));

        merchant.setName(request.getName());
        merchant.setAddress(request.getAddress());
        merchant.setContactInfo(request.getContactInfo());

        Merchant updated = merchantRepository.save(merchant);
        return toResponseDTO(updated);
    }

    @Transactional
    public void deleteMerchant(Long id) {
        if (!merchantRepository.existsById(id)) {
            throw new IllegalArgumentException("Merchant not found");
        }
        merchantRepository.deleteById(id);
    }

    private MerchantResponseDTO toResponseDTO(Merchant merchant) {
        return new MerchantResponseDTO(
            merchant.getId(),
            merchant.getName(),
            merchant.getAddress(),
            merchant.getContactInfo(),
            merchant.getOwnerId()
        );
    }
}

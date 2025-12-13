package vu.software_project.sdp.services;

import vu.software_project.sdp.DTOs.item.ItemCreateRequestDTO;
import vu.software_project.sdp.DTOs.item.ItemResponseDTO;
import vu.software_project.sdp.DTOs.item.ItemUpdateRequestDTO;
import vu.software_project.sdp.entities.ServiceItem;
import vu.software_project.sdp.repositories.ServiceItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceItemService {
    private final ServiceItemRepository serviceItemRepository;

    public ServiceItemService(ServiceItemRepository serviceItemRepository) {
        this.serviceItemRepository = serviceItemRepository;
    }

    @Transactional
    public ItemResponseDTO createServiceItem(ItemCreateRequestDTO request, Long merchantId) {
        ServiceItem serviceItem = new ServiceItem();
        serviceItem.setName(request.getName());
        serviceItem.setPrice(request.getPrice());
        serviceItem.setMerchantId(merchantId);
        serviceItem.setTaxRateId(request.getTaxRateId());

        ServiceItem saved = serviceItemRepository.save(serviceItem);
        return toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public ItemResponseDTO getServiceItemById(Long id) {
        ServiceItem serviceItem = serviceItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("ServiceItem not found"));
        return toResponseDTO(serviceItem);
    }

    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getServiceItemsByMerchant(Long merchantId) {
        return serviceItemRepository.findByMerchantId(merchantId)
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public ItemResponseDTO updateServiceItem(Long id, ItemUpdateRequestDTO request) {
        ServiceItem serviceItem = serviceItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("ServiceItem not found"));

        serviceItem.setName(request.getName());
        serviceItem.setPrice(request.getPrice());
        serviceItem.setTaxRateId(request.getTaxRateId());

        ServiceItem updated = serviceItemRepository.save(serviceItem);
        return toResponseDTO(updated);
    }

    @Transactional
    public void deleteServiceItem(Long id) {
        if (!serviceItemRepository.existsById(id)) {
            throw new IllegalArgumentException("ServiceItem not found");
        }
        serviceItemRepository.deleteById(id);
    }

    private ItemResponseDTO toResponseDTO(ServiceItem serviceItem) {
        return new ItemResponseDTO(
            serviceItem.getId(),
            serviceItem.getName(),
            serviceItem.getPrice(),
            "SERVICE_ITEM",
            serviceItem.getTaxRateId(),
            null
        );
    }
}

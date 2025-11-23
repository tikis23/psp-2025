package vu.software_project.sdp.services;

import vu.software_project.sdp.DTOs.item.ItemCreateRequestDTO;
import vu.software_project.sdp.DTOs.item.ItemResponseDTO;
import vu.software_project.sdp.DTOs.item.ItemUpdateRequestDTO;
import vu.software_project.sdp.entities.Service;
import vu.software_project.sdp.repositories.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceService {
    private final ServiceRepository serviceRepository;

    public ServiceService(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Transactional
    public ItemResponseDTO createService(ItemCreateRequestDTO request, Long merchantId) {
        Service service = new Service();
        service.setName(request.getName());
        service.setPrice(request.getPrice());
        service.setMerchantId(merchantId);
        service.setTaxRateId(request.getTaxRateId());

        Service saved = serviceRepository.save(service);
        return toResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public ItemResponseDTO getServiceById(Long id) {
        Service service = serviceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Service not found"));
        return toResponseDTO(service);
    }

    @Transactional(readOnly = true)
    public List<ItemResponseDTO> getServicesByMerchant(Long merchantId) {
        return serviceRepository.findByMerchantId(merchantId)
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public ItemResponseDTO updateService(Long id, ItemUpdateRequestDTO request) {
        Service service = serviceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Service not found"));

        service.setName(request.getName());
        service.setPrice(request.getPrice());
        service.setTaxRateId(request.getTaxRateId());

        Service updated = serviceRepository.save(service);
        return toResponseDTO(updated);
    }

    @Transactional
    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new IllegalArgumentException("Service not found");
        }
        serviceRepository.deleteById(id);
    }

    private ItemResponseDTO toResponseDTO(Service service) {
        return new ItemResponseDTO(
            service.getId(),
            service.getName(),
            service.getPrice(),
            "SERVICE",
            service.getTaxRateId(),
            null
        );
    }
}

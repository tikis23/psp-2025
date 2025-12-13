package vu.software_project.sdp.DTOs.orders;

import java.util.Optional;

import lombok.Data;

@Data
public class OrderAddItemRequestDTO {
    
    private Long itemId;
    private Long quantity;
    private Long variationId;
}

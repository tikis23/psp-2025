package vu.software_project.sdp.DTOs.orders;

import lombok.Data;

@Data
public class OrderAddItemRequestDTO {
    
    private Long itemId;
    private Long quantity;
    private Long variationId;
}

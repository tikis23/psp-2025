package vu.software_project.sdp.DTOs.orders;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemDTO {
    private Long id;
    private String name;
    private Long quantity;
    private BigDecimal price;
    // private Long taxRateId;
    private List<OrderItemVariationDTO> variations;
}

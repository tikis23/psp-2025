package vu.software_project.sdp.DTOs.orders;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemVariationDTO {
    private Long id;
    private String name;
    private BigDecimal priceOffset;
}

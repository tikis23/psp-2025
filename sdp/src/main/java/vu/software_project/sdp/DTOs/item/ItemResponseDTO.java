package vu.software_project.sdp.DTOs.item;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemResponseDTO {
    private Long id;
    private String name;
    private BigDecimal price;
    private String type; // "PRODUCT" or "SERVICE"
    private String taxRateId;
    private List<ProductVariationResponseDTO> variations;
}

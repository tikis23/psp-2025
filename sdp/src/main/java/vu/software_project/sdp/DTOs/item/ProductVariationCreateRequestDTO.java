package vu.software_project.sdp.DTOs.item;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariationCreateRequestDTO {
    private String name;
    private BigDecimal priceOffset;
}

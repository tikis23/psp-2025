package vu.software_project.sdp.DTOs.orders;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderCostInfoDTO {
    BigDecimal subtotal;
    BigDecimal taxAmount;
    BigDecimal discountAmount;
    BigDecimal total;
    List<String> taxBreakdown;
    List<String> discountBreakdown;
}
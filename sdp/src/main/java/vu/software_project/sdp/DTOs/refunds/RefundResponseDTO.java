package vu.software_project.sdp.DTOs.refunds;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class RefundResponseDTO {

    private String refundId;
    private String orderId;
    private BigDecimal totalAmount;
    private String status;
    private OffsetDateTime createdAt;

    private List<RefundBreakdownDTO> refundBreakdown;
}

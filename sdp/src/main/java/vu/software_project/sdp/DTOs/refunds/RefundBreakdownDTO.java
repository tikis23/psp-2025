package vu.software_project.sdp.DTOs.refunds;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RefundBreakdownDTO {
    private String originalPaymentId;
    private String paymentType;
    private BigDecimal amount;
    private String refundStatus;
    private String stripeRefundId;
}


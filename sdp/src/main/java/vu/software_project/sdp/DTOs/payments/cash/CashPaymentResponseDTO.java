package vu.software_project.sdp.DTOs.payments.cash;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CashPaymentResponseDTO {
    private String id;
    private String orderId;
    private String paymentType;
    private BigDecimal amount;
    private String status;
    private OffsetDateTime createdAt;
    private BigDecimal remainingBalance;
    private BigDecimal tip;
    private BigDecimal changeDue;
}

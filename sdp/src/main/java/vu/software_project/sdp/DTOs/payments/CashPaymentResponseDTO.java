package vu.software_project.sdp.DTOs.payments;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class CashPaymentResponseDTO {

    private String id;

    @JsonProperty("orderId")
    private String orderId;

    @JsonProperty("payment_type")
    private String paymentType;

    private BigDecimal amount;

    private String status;

    private OffsetDateTime createdAt;

    private BigDecimal remainingBalance;
}

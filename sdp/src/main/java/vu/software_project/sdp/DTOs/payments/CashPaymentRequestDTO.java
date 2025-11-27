package vu.software_project.sdp.DTOs.payments;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CashPaymentRequestDTO {

    @JsonProperty("payment_type")
    private String paymentType;

    private BigDecimal amount;
}

package vu.software_project.sdp.DTOs.orders;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;
import vu.software_project.sdp.entities.Payment;

@Data
@Builder
public class PaymentInfoDTO {
    private Long id;
    private Payment.PaymentType type;
    private Payment.Status status;
    private BigDecimal amount;
    private BigDecimal tip;
}

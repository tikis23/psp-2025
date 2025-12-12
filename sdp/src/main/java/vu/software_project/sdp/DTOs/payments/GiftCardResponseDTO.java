package vu.software_project.sdp.DTOs.payments;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class GiftCardResponseDTO {
    private String code;
    private BigDecimal balance;
}

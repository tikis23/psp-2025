package vu.software_project.sdp.DTOs.payments.giftcard;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class GiftCardResponseDTO {
    private String code;
    private BigDecimal initialBalance;
    private BigDecimal currentBalance;
    private Boolean active;
    private OffsetDateTime createdAt;
    private OffsetDateTime expiryDate;
}

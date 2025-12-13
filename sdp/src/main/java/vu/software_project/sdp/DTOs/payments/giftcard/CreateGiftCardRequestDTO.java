package vu.software_project.sdp.DTOs.payments.giftcard;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateGiftCardRequestDTO {
    private BigDecimal amount;
}

package vu.software_project.sdp.DTOs.payments;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class GiftCardPaymentResponseDTO extends CashPaymentResponseDTO {

    private String giftCardCode;
    private BigDecimal remainingCardBalance;
}

package vu.software_project.sdp.DTOs.payments.giftcard;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;
import vu.software_project.sdp.DTOs.payments.cash.CashPaymentResponseDTO;

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

package vu.software_project.sdp.DTOs.payments.card;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CardPaymentResponseDTO {
    private String paymentId;
    private String stripeClientSecret;
}

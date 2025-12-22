package vu.software_project.sdp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payments")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = true)
    private String stripePaymentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType paymentType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "cash_received", precision = 12, scale = 2)
    private BigDecimal cashReceived; //For cash

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal tip;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    public enum PaymentType {
        CASH,
        GIFT_CARD,
        CARD
    }

    public enum Status {
        REQUIRES_ACTION,
        PROCESSING,
        SUCCEEDED,
        FAILED,
        CANCELED,
        REFUNDED
    }
}

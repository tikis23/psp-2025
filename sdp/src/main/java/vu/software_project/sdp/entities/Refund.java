package vu.software_project.sdp.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "refunds")
@Data
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RefundStatus status;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    public enum RefundStatus {
        PROCESSING,
        COMPLETED,
        FAILED
    }
}

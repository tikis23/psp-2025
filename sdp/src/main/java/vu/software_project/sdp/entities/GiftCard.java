package vu.software_project.sdp.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "gift_cards")
@Data
@NoArgsConstructor
public class GiftCard {

    @Id
    @Column(length = 40)
    private String code;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal initialBalance;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal currentBalance;

    @Column(nullable = false)
    private Boolean active = true;

    private OffsetDateTime expiryDate;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private Long merchantId;
}

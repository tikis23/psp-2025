// File: main/java/vu/software_project/sdp/entities/Discount.java
package vu.software_project.sdp.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "discounts")
@Data
public class Discount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private BigDecimal value;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Scope scope;

    private Long productId;

    @Column(nullable = false)
    private Long merchantId;

    private LocalDateTime validFrom;
    private LocalDateTime validTo;

    public enum Type { PERCENTAGE, FIXED_AMOUNT }
    public enum Scope { ORDER, PRODUCT }

    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        if (validFrom != null && now.isBefore(validFrom)) return false;
        if (validTo != null && now.isAfter(validTo)) return false;
        return true;
    }
}
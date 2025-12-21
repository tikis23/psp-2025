package vu.software_project.sdp.entities;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.math.BigDecimal;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long merchantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "discount_id")
    private String discountId;

    @Column(precision = 10, scale = 2)
    private BigDecimal appliedDiscountAmount = BigDecimal.ZERO;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "orderId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    public enum Status {
        OPEN, PAID, CANCELLED, REFUNDED;

        private EnumSet<Status> allowedTransitions;
        static {
            OPEN.allowedTransitions = EnumSet.of(CANCELLED, PAID);
            PAID.allowedTransitions = EnumSet.of(REFUNDED);
            CANCELLED.allowedTransitions = EnumSet.noneOf(Status.class);
            REFUNDED.allowedTransitions = EnumSet.noneOf(Status.class);
        }

        public boolean canTransitionTo(Status newStatus) {
            return allowedTransitions.contains(newStatus);
        }

        public Status transitionTo(Status newStatus) {
            if (!canTransitionTo(newStatus)) {
                throw new IllegalStateException("Invalid status transition from " + this + " to " + newStatus);
            }
            return newStatus;
        }
    }
}
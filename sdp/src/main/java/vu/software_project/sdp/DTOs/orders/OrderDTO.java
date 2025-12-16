package vu.software_project.sdp.DTOs.orders;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;
import vu.software_project.sdp.entities.Order;

@Data
@Builder
public class OrderDTO {

    private Long id;
    private Long merchantId;
    private Order.Status status;
    private List<OrderItemDTO> items;
    private List<PaymentInfoDTO> payments;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal total;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

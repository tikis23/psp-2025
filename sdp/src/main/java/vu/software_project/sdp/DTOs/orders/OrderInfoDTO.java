package vu.software_project.sdp.DTOs.orders;

import java.time.OffsetDateTime;

import lombok.Data;
import vu.software_project.sdp.entities.Order;

@Data
public class OrderInfoDTO {
    private Long id;
    private Long merchantId;
    private Order.Status status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

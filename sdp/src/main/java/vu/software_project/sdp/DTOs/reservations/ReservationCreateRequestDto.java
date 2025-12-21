package vu.software_project.sdp.DTOs.reservations;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ReservationCreateRequestDto {
    private Long merchantId;
    private Long serviceId;
    private Long employeeId;
    private String customerName;
    private String customerContact;
    private java.time.LocalDateTime appointmentTime;
}
package vu.software_project.sdp.DTOs.reservations;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReservationCreateRequestDto {
    private Long merchantId;
    private Long serviceId;
    private Long employeeId;
    private String customerName;
    private String customerContact;
    private LocalDateTime appointmentTime;
}
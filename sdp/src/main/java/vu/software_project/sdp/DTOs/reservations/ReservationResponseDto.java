package vu.software_project.sdp.DTOs.reservations;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReservationResponseDto {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private Long employeeId;
    private String employeeName;
    private String customerName;
    private String customerContact;
    private java.time.LocalDateTime appointmentTime;
    private java.time.LocalDateTime bookedAt;
    private String status;
}
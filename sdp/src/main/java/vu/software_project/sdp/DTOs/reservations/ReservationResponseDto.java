package vu.software_project.sdp.DTOs.reservations;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class ReservationResponseDto {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private String customerName;
    private String customerContact;
    private OffsetDateTime appointmentTime;
    private String status;
}
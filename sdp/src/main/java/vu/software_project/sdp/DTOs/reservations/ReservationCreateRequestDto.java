package vu.software_project.sdp.DTOs.reservation;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ReservationCreateRequestDto {
    private Long serviceId;
    private String customerName;
    private String customerContact;
    private OffsetDateTime appointmentTime;
}
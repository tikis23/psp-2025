package vu.software_project.sdp.DTOs;

import lombok.Data;
import vu.software_project.sdp.entities.User;

@Data
public class UserRegisterRequestDTO {
    private String username;
    private String email;
    private String password;
    private User.Role role;
    private Long merchantId; // For BUSINESS_OWNER role
}


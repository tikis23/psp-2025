package vu.software_project.sdp.DTOs.auth;

import lombok.Data;
import vu.software_project.sdp.entities.User;

@Data
public class UserRegisterRequestDTO {
    private String username;
    private String email;
    private String password;
    private User.Role role;
    private String merchantId; // For BUSINESS_OWNER role
}


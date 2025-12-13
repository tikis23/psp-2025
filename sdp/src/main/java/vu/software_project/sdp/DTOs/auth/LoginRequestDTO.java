package vu.software_project.sdp.DTOs.auth;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String email;
    private String password;
}


package vu.software_project.sdp.DTOs.users;

import lombok.Data;

@Data
public class UserCreateDTO {
    private String name;
    private String email;
    private String password;
    private String role;
    private Long merchantId;
}

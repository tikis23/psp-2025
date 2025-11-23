package vu.software_project.sdp.DTOs.merchant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MerchantUpdateRequestDTO {
    private String name;
    private String address;
    private String contactInfo;
}

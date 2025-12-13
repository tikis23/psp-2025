package vu.software_project.sdp.DTOs.merchant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MerchantResponseDTO {
    private Long id;
    private String name;
    private String address;
    private String contactInfo;
    private Long ownerId;
}

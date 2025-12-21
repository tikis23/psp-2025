package vu.software_project.sdp.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String name; // Optional display name

    @Column(name = "merchant_id")
    private Long merchantId;

    public enum Role {
        SUPER_ADMIN,
        BUSINESS_OWNER,
        EMPLOYEE
    }
}

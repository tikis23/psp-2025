package vu.software_project.sdp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "merchants")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Merchant {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;

    private String contactInfo;

    @Column(nullable = false)
    private Long ownerId; // foreign key to User
}


package vu.software_project.sdp.controllers;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import vu.software_project.sdp.DTOs.users.UserCreateDTO;
import vu.software_project.sdp.entities.User;
import vu.software_project.sdp.repositories.UserRepository;
import vu.software_project.sdp.services.UserService;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserCreateDTO userCreateDTO) {
        try {
            userService.createNewUser(userCreateDTO);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @GetMapping("/merchant/{merchantId}")
    public ResponseEntity<List<User>> getEmployeesByMerchant(@PathVariable Long merchantId) {
        return ResponseEntity.ok(userRepository.findByMerchantId(merchantId));
    }

}
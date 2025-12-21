package vu.software_project.sdp.config.security;


import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@AllArgsConstructor
@Getter
public class CustomUserDetails implements org.springframework.security.core.userdetails.UserDetails {
    private final Long id;
    private final String email;
    private final String username;
    private final Long merchantId;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
}


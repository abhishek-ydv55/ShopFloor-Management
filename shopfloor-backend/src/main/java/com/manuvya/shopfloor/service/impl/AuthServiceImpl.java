package com.manuvya.shopfloor.service.impl;

import com.manuvya.shopfloor.dto.request.LoginRequest;
import com.manuvya.shopfloor.dto.response.LoginResponse;
import com.manuvya.shopfloor.entity.User;
import com.manuvya.shopfloor.exception.ResourceNotFoundException;
import com.manuvya.shopfloor.repository.UserRepository;
import com.manuvya.shopfloor.security.JwtUtil;
import com.manuvya.shopfloor.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getEmpId());

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .email(user.getEmail())
                .role(user.getRole())
                .empId(user.getEmpId())
                .name(user.getName())
                .expiresIn(jwtUtil.getExpiration())
                .build();
    }
}

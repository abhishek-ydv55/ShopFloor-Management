package com.manuvya.shopfloor.dto.response;

import lombok.*;

/** JWT login response — Angular stores token and uses role for routing */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginResponse {
    private String token;
    private String tokenType;
    private String email;
    private String role;
    private String empId;
    private String name;
    private long expiresIn;
}

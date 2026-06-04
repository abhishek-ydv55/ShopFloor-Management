package com.manuvya.shopfloor.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkerResponse {
    private Long id;
    private String empId;
    private String name;
    private String role;
    private String email;
    private boolean active;
    private String createdAt;
}

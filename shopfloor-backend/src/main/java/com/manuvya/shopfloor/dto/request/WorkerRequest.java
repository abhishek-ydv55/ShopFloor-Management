package com.manuvya.shopfloor.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/** Matches Angular's register-worker form: empId, empName, role, password */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WorkerRequest {

    @NotBlank(message = "Employee ID is required")
    private String empId;

    @NotBlank(message = "Employee Name is required")
    @Size(min = 3, message = "Name must be more than 3 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Name must contain only alphabets")
    private String name;

    @NotBlank(message = "Please select a role")
    @Pattern(
        regexp = "^(supervisor|technician|maintenance_manager|maintenance_supervisor|manager|procurement|inventory|admin|Supervisor|Technician|Maintenance Manager|Maintenance Supervisor|Manager|Procurement|Inventory|Admin)$",
        message = "Invalid role"
    )
    private String role;

    @Size(min = 6, max = 15, message = "Password must be 6-15 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{6,15}$",
        message = "Password must be 6-15 chars with upper, lower, number, and special char (@$!%*?&#)"
    )
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;
}

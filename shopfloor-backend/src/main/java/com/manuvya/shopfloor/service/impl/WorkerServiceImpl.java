package com.manuvya.shopfloor.service.impl;

import com.manuvya.shopfloor.dto.request.WorkerRequest;
import com.manuvya.shopfloor.dto.response.WorkerResponse;
import com.manuvya.shopfloor.entity.User;
import com.manuvya.shopfloor.exception.BusinessException;
import com.manuvya.shopfloor.exception.DuplicateResourceException;
import com.manuvya.shopfloor.exception.ResourceNotFoundException;
import com.manuvya.shopfloor.repository.UserRepository;
import com.manuvya.shopfloor.service.WorkerService;
import com.manuvya.shopfloor.util.DateUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkerServiceImpl implements WorkerService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static String normalizeRole(String role) {
        return switch (role) {
            case "Supervisor"            -> "supervisor";
            case "Technician"            -> "technician";
            case "Maintenance Manager"   -> "maintenance_manager";
            case "Maintenance Supervisor"-> "maintenance_supervisor";
            case "Manager"               -> "manager";
            case "Procurement"           -> "procurement";
            case "Inventory"             -> "inventory";
            case "Admin"                 -> "admin";
            default                      -> role.toLowerCase().replace(" ", "_");
        };
    }

    @Override
    public WorkerResponse createWorker(WorkerRequest request) {
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BusinessException("Password is required");
        }
        if (userRepository.existsByEmpId(request.getEmpId())) {
            throw new DuplicateResourceException("Employee ID already exists: " + request.getEmpId());
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        User user = User.builder()
                .empId(request.getEmpId())
                .name(request.getName())
                .role(normalizeRole(request.getRole()))
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .build();

        return toResponse(userRepository.save(user));
    }

    @Override
    public WorkerResponse getWorkerByEmpId(String empId) {
        return toResponse(findByEmpId(empId));
    }

    @Override
    public List<WorkerResponse> getAllWorkers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<WorkerResponse> getWorkersByRole(String role) {
        return userRepository.findByRole(role).stream().map(this::toResponse).toList();
    }

    @Override
    public WorkerResponse updateWorker(String empId, WorkerRequest request) {
        User user = findByEmpId(empId);
        user.setName(request.getName());
        user.setRole(normalizeRole(request.getRole()));
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return toResponse(userRepository.save(user));
    }

    @Override
    public void deleteWorker(String empId) {
        User user = findByEmpId(empId);
        userRepository.delete(user);
    }

    @Override
    public void toggleWorkerStatus(String empId) {
        User user = findByEmpId(empId);
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    private User findByEmpId(String empId) {
        return userRepository.findByEmpId(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker", "empId", empId));
    }

    private WorkerResponse toResponse(User user) {
        return WorkerResponse.builder()
                .id(user.getId())
                .empId(user.getEmpId())
                .name(user.getName())
                .role(user.getRole())
                .email(user.getEmail())
                .active(user.isActive())
                .createdAt(DateUtil.toDisplayString(user.getCreatedAt()))
                .build();
    }
}

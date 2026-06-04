package com.manuvya.shopfloor.service.impl;

import com.manuvya.shopfloor.dto.response.MaintenanceTicketResponse;
import com.manuvya.shopfloor.entity.Machine;
import com.manuvya.shopfloor.entity.MaintenanceTicket;
import com.manuvya.shopfloor.exception.BusinessException;
import com.manuvya.shopfloor.exception.ResourceNotFoundException;
import com.manuvya.shopfloor.repository.MachineRepository;
import com.manuvya.shopfloor.repository.MaintenanceTicketRepository;
import com.manuvya.shopfloor.service.MaintenanceTicketService;
import com.manuvya.shopfloor.util.DateUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceTicketServiceImpl implements MaintenanceTicketService {

    private final MaintenanceTicketRepository repository;
    private final MachineRepository machineRepository;

    @Override
    public MaintenanceTicketResponse createTicketIfNotExists(String machineId, String machineName,
                                                              int hoursUsed, int thresholdHours) {
        if (repository.existsByMachineIdAndStatusNot(machineId, MaintenanceTicket.TicketStatus.Completed)) {
            return null;
        }
        long count = repository.count();
        String code = String.format("MTKT-%03d", count + 1);
        MaintenanceTicket ticket = MaintenanceTicket.builder()
                .ticketCode(code)
                .machineId(machineId)
                .machineName(machineName)
                .hoursUsed(hoursUsed)
                .thresholdHours(thresholdHours)
                .priority("High")
                .status(MaintenanceTicket.TicketStatus.Open)
                .build();
        return toResponse(repository.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaintenanceTicketResponse> getAllTickets() {
        return repository.findAllByOrderByRaisedAtDesc().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MaintenanceTicketResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public MaintenanceTicketResponse assignTechnician(Long id, String technicianName, String taskId) {
        MaintenanceTicket ticket = findById(id);
        if (ticket.getStatus() == MaintenanceTicket.TicketStatus.Completed) {
            throw new BusinessException("Cannot assign technician to a completed ticket");
        }
        ticket.setAssignedTo(technicianName);
        ticket.setTaskId(taskId);
        ticket.setStatus(MaintenanceTicket.TicketStatus.Assigned);
        return toResponse(repository.save(ticket));
    }

    @Override
    public MaintenanceTicketResponse updateStatus(Long id, String status) {
        MaintenanceTicket ticket = findById(id);
        try {
            ticket.setStatus(MaintenanceTicket.TicketStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status: " + status);
        }
        return toResponse(repository.save(ticket));
    }

    @Override
    public MaintenanceTicketResponse complete(Long id) {
        MaintenanceTicket ticket = findById(id);
        ticket.setStatus(MaintenanceTicket.TicketStatus.Completed);
        ticket.setCompletedAt(LocalDateTime.now());
        MaintenanceTicketResponse response = toResponse(repository.save(ticket));

        machineRepository.findById(ticket.getMachineId()).ifPresent(machine -> {
            machine.setHours(0);
            if (machine.getStatus() == Machine.MachineStatus.Maintenance) {
                machine.setStatus(Machine.MachineStatus.Active);
            }
            machineRepository.save(machine);
        });

        return response;
    }

    @Override
    public void deleteTicket(Long id) {
        repository.delete(findById(id));
    }

    @Override
    public void deleteCompleted() {
        repository.deleteByStatus(MaintenanceTicket.TicketStatus.Completed);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(String status) {
        try {
            return repository.countByStatus(MaintenanceTicket.TicketStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            return 0;
        }
    }

    private MaintenanceTicket findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceTicket", "id", id));
    }

    private MaintenanceTicketResponse toResponse(MaintenanceTicket t) {
        return MaintenanceTicketResponse.builder()
                .id(t.getId())
                .ticketCode(t.getTicketCode())
                .machineId(t.getMachineId())
                .machineName(t.getMachineName())
                .hoursUsed(t.getHoursUsed())
                .thresholdHours(t.getThresholdHours())
                .priority(t.getPriority())
                .status(t.getStatus().name())
                .assignedTo(t.getAssignedTo())
                .taskId(t.getTaskId())
                .raisedAt(t.getRaisedAt() != null ? DateUtil.toDisplayString(t.getRaisedAt()) : null)
                .completedAt(t.getCompletedAt() != null ? DateUtil.toDisplayString(t.getCompletedAt()) : null)
                .build();
    }
}

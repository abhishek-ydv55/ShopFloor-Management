package com.manuvya.shopfloor.service.impl;

import com.manuvya.shopfloor.dto.request.IssueRequest;
import com.manuvya.shopfloor.dto.response.IssueResponse;
import com.manuvya.shopfloor.entity.Machine;
import com.manuvya.shopfloor.entity.MaintenanceIssue;
import com.manuvya.shopfloor.exception.BusinessException;
import com.manuvya.shopfloor.exception.ResourceNotFoundException;
import com.manuvya.shopfloor.repository.MachineRepository;
import com.manuvya.shopfloor.repository.MaintenanceIssueRepository;
import com.manuvya.shopfloor.service.IssueService;
import com.manuvya.shopfloor.service.MaintenanceTicketService;
import com.manuvya.shopfloor.util.DateUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class IssueServiceImpl implements IssueService {

    private final MaintenanceIssueRepository issueRepository;
    private final MachineRepository machineRepository;
    private final MaintenanceTicketService maintenanceTicketService;

    @Override
    public IssueResponse createIssue(IssueRequest request) {
        MaintenanceIssue issue = MaintenanceIssue.builder()
                .machine(request.getMachine())
                .type(request.getType())
                .description(request.getDescription())
                .severity(request.getSeverity())
                .date(request.getDate())
                .reportedBy(request.getReportedBy())
                .status(MaintenanceIssue.IssueStatus.Open)
                .build();
        IssueResponse response = toResponse(issueRepository.save(issue));

        // Any issue report marks the machine for maintenance so the manager can assign a technician
        machineRepository.findById(request.getMachine()).ifPresent(machine -> {
            if (machine.getStatus() == Machine.MachineStatus.Active) {
                machine.setStatus(Machine.MachineStatus.Maintenance);
                machineRepository.save(machine);
                maintenanceTicketService.createTicketIfNotExists(
                        machine.getId(), machine.getName(),
                        machine.getHours(), machine.getThresholdHours());
            }
        });

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueResponse> getAllIssues() {
        return issueRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueResponse> getIssuesByMachine(String machine) {
        return issueRepository.findByMachine(machine).stream().map(this::toResponse).toList();
    }

    @Override
    public IssueResponse updateIssueStatus(Long id, String status) {
        MaintenanceIssue issue = findById(id);
        try {
            issue.setStatus(MaintenanceIssue.IssueStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid issue status: " + status);
        }
        return toResponse(issueRepository.save(issue));
    }

    @Override
    public void deleteIssue(Long id) {
        issueRepository.delete(findById(id));
    }

    private MaintenanceIssue findById(Long id) {
        return issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));
    }

    private IssueResponse toResponse(MaintenanceIssue i) {
        return IssueResponse.builder()
                .id(i.getId()).machine(i.getMachine()).type(i.getType())
                .description(i.getDescription()).severity(i.getSeverity())
                .date(i.getDate()).status(i.getStatus().name())
                .reportedBy(i.getReportedBy())
                .createdAt(DateUtil.toDisplayString(i.getCreatedAt()))
                .build();
    }
}

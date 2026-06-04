package com.manuvya.shopfloor.service.impl;

import com.manuvya.shopfloor.dto.request.AssignTechnicianRequest;
import com.manuvya.shopfloor.dto.request.TicketHistoryRequest;
import com.manuvya.shopfloor.dto.request.TicketRequest;
import com.manuvya.shopfloor.dto.response.TicketHistoryResponse;
import com.manuvya.shopfloor.dto.response.TicketResponse;
import com.manuvya.shopfloor.dto.response.TicketStatsResponse;
import com.manuvya.shopfloor.entity.Ticket;
import com.manuvya.shopfloor.entity.TicketHistory;
import com.manuvya.shopfloor.exception.BusinessException;
import com.manuvya.shopfloor.exception.ResourceNotFoundException;
import com.manuvya.shopfloor.repository.TicketHistoryRepository;
import com.manuvya.shopfloor.repository.TicketRepository;
import com.manuvya.shopfloor.service.TicketService;
import com.manuvya.shopfloor.util.DateUtil;
import com.manuvya.shopfloor.util.IdGeneratorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final TicketHistoryRepository historyRepository;

    @Override
    public TicketResponse createTicket(TicketRequest request) {
        Ticket ticket = Ticket.builder()
                .id(IdGeneratorUtil.generateTicketId())
                .priority(Ticket.Priority.valueOf(request.getPriority()))
                .status(Ticket.TicketStatus.Open)
                .approvalStatus(Ticket.ApprovalStatus.Pending)
                .currentDepartment(request.getCurrentDepartment())
                .description(request.getDescription())
                .department(request.getDepartment())
                .build();
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(String id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByDepartment(String department) {
        return ticketRepository.findByDepartment(department).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByTechnician(String technicianEmpId) {
        return ticketRepository.findByAssignedTechnician(technicianEmpId).stream().map(this::toResponse).toList();
    }

    @Override
    public TicketResponse updateTicketStatus(String id, String status, String comment, String handledBy) {
        Ticket ticket = findById(id);
        try {
            ticket.setStatus(Ticket.TicketStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid ticket status: " + status);
        }
        Ticket saved = ticketRepository.save(ticket);

        if ("Closed".equals(status) && comment != null && !comment.isBlank()) {
            TicketHistory history = TicketHistory.builder()
                    .ticket(saved)
                    .department(saved.getCurrentDepartment())
                    .action("Ticket Closed")
                    .comment(comment.trim())
                    .handledBy(handledBy != null && !handledBy.isBlank() ? handledBy.trim() : "System")
                    .date(DateUtil.todayDisplay())
                    .build();
            historyRepository.save(history);
        }

        return toResponse(saved);
    }

    @Override
    public TicketResponse updateApprovalStatus(String id, String approvalStatus) {
        Ticket ticket = findById(id);
        try {
            ticket.setApprovalStatus(Ticket.ApprovalStatus.valueOf(approvalStatus));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid approval status: " + approvalStatus);
        }
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponse assignTechnician(AssignTechnicianRequest request) {
        Ticket ticket = findById(request.getTicketId());
        ticket.setAssignedTechnician(request.getTechnicianEmpId());
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponse addHistory(String ticketId, TicketHistoryRequest request) {
        Ticket ticket = findById(ticketId);
        TicketHistory history = TicketHistory.builder()
                .ticket(ticket)
                .department(request.getDepartment())
                .action(request.getAction())
                .comment(request.getComment())
                .handledBy(request.getHandledBy())
                .date(request.getDate())
                .build();
        historyRepository.save(history);
        return toResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketStatsResponse getTicketStats() {
        return TicketStatsResponse.builder()
                .total(ticketRepository.count())
                .open(ticketRepository.countByStatus(Ticket.TicketStatus.Open))
                .inProgress(0)
                .resolved(0)
                .closed(ticketRepository.countByStatus(Ticket.TicketStatus.Closed))
                .pendingApproval(ticketRepository.countByApprovalStatus(Ticket.ApprovalStatus.Pending))
                .approved(ticketRepository.countByApprovalStatus(Ticket.ApprovalStatus.Approved))
                .rejected(ticketRepository.countByApprovalStatus(Ticket.ApprovalStatus.Rejected))
                .build();
    }

    @Override
    public void deleteTicket(String id) {
        ticketRepository.delete(findById(id));
    }

    private Ticket findById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
    }

    private TicketHistoryResponse toHistoryResponse(TicketHistory h) {
        return TicketHistoryResponse.builder()
                .id(h.getId())
                .ticketId(h.getTicket().getId())
                .department(h.getDepartment())
                .action(h.getAction())
                .comment(h.getComment())
                .handledBy(h.getHandledBy())
                .date(h.getDate())
                .createdAt(DateUtil.toDisplayString(h.getCreatedAt()))
                .build();
    }

    private TicketResponse toResponse(Ticket t) {
        List<TicketHistoryResponse> history = historyRepository
                .findByTicketIdOrderByCreatedAtAsc(t.getId())
                .stream().map(this::toHistoryResponse).toList();
        return TicketResponse.builder()
                .id(t.getId())
                .priority(t.getPriority().name())
                .status(t.getStatus().name())
                .approvalStatus(t.getApprovalStatus().name())
                .currentDepartment(t.getCurrentDepartment())
                .isClosable(t.isClosable())
                .description(t.getDescription())
                .department(t.getDepartment())
                .assignedTechnician(t.getAssignedTechnician())
                .createdAt(DateUtil.toDisplayString(t.getCreatedAt()))
                .updatedAt(DateUtil.toDisplayString(t.getUpdatedAt()))
                .history(history)
                .build();
    }
}

package com.manuvya.shopfloor.service.impl;

import com.manuvya.shopfloor.dto.response.DashboardStatsResponse;
import com.manuvya.shopfloor.dto.response.MachineStatsResponse;
import com.manuvya.shopfloor.dto.response.TicketStatsResponse;
import com.manuvya.shopfloor.entity.Machine;
import com.manuvya.shopfloor.entity.MaintenanceIssue;
import com.manuvya.shopfloor.entity.SpareRequest;
import com.manuvya.shopfloor.entity.Ticket;
import com.manuvya.shopfloor.entity.InternalProcurementRequest;
import com.manuvya.shopfloor.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements com.manuvya.shopfloor.service.DashboardService {

    private final TicketRepository ticketRepository;
    private final MachineRepository machineRepository;
    private final UserRepository userRepository;
    private final InventoryItemRepository inventoryRepository;
    private final SpareRequestRepository spareRequestRepository;
    private final InternalProcurementRequestRepository internalProcurementRepository;
    private final MaintenanceIssueRepository issueRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        TicketStatsResponse ticketStats = TicketStatsResponse.builder()
                .total(ticketRepository.count())
                .open(ticketRepository.countByStatus(Ticket.TicketStatus.Open))
                .closed(ticketRepository.countByStatus(Ticket.TicketStatus.Closed))
                .pendingApproval(ticketRepository.countByApprovalStatus(Ticket.ApprovalStatus.Pending))
                .approved(ticketRepository.countByApprovalStatus(Ticket.ApprovalStatus.Approved))
                .rejected(ticketRepository.countByApprovalStatus(Ticket.ApprovalStatus.Rejected))
                .build();

        MachineStatsResponse machineStats = MachineStatsResponse.builder()
                .total(machineRepository.count())
                .active(machineRepository.countByStatus(Machine.MachineStatus.Active))
                .maintenance(machineRepository.countByStatus(Machine.MachineStatus.Maintenance))
                .inactive(machineRepository.countByStatus(Machine.MachineStatus.Inactive))
                .totalHours(machineRepository.findAll().stream().mapToLong(Machine::getHours).sum())
                .build();

        return DashboardStatsResponse.builder()
                .ticketStats(ticketStats)
                .machineStats(machineStats)
                .totalWorkers(userRepository.count())
                .totalInventoryItems(inventoryRepository.count())
                .lowStockItems(inventoryRepository.countLowStockItems())
                .pendingSpareRequests(spareRequestRepository.countByStatus(SpareRequest.RequestStatus.Pending))
                .pendingProcurementRequests(internalProcurementRepository.countByStatus(InternalProcurementRequest.RequestStatus.Pending))
                .openIssues(issueRepository.countByStatus(MaintenanceIssue.IssueStatus.Open))
                .build();
    }
}

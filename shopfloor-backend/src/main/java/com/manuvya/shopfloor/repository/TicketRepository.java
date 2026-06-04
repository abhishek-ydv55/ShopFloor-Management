package com.manuvya.shopfloor.repository;

import com.manuvya.shopfloor.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    List<Ticket> findByDepartment(String department);
    List<Ticket> findByStatus(Ticket.TicketStatus status);
    List<Ticket> findByAssignedTechnician(String technicianEmpId);
    List<Ticket> findByCurrentDepartment(String department);
    long countByStatus(Ticket.TicketStatus status);
    long countByApprovalStatus(Ticket.ApprovalStatus approvalStatus);
}

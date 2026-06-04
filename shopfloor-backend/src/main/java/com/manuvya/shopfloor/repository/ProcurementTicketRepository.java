package com.manuvya.shopfloor.repository;

import com.manuvya.shopfloor.entity.ProcurementTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcurementTicketRepository extends JpaRepository<ProcurementTicket, Long> {
    List<ProcurementTicket> findByDepartment(String department);
    List<ProcurementTicket> findBySentToExternalTrue();
    List<ProcurementTicket> findByStatus(ProcurementTicket.TicketStatus status);
    void deleteByStatus(ProcurementTicket.TicketStatus status);
}

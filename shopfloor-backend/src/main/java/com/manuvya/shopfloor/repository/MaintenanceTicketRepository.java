package com.manuvya.shopfloor.repository;

import com.manuvya.shopfloor.entity.MaintenanceTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, Long> {
    boolean existsByMachineIdAndStatusNot(String machineId, MaintenanceTicket.TicketStatus status);
    List<MaintenanceTicket> findByStatus(MaintenanceTicket.TicketStatus status);
    List<MaintenanceTicket> findAllByOrderByRaisedAtDesc();
    long countByStatus(MaintenanceTicket.TicketStatus status);
    Optional<MaintenanceTicket> findByTicketCode(String ticketCode);
    void deleteByStatus(MaintenanceTicket.TicketStatus status);
}

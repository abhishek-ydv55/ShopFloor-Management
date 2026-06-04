package com.manuvya.shopfloor.config;

import com.manuvya.shopfloor.entity.*;
import com.manuvya.shopfloor.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MachineRepository machineRepository;
    private final TicketRepository ticketRepository;
    private final InventoryItemRepository inventoryRepository;
    private final ProcurementTicketRepository procurementTicketRepository;
    private final MaintenanceIssueRepository issueRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Data already seeded — skipping initialization");
            return;
        }

        seedUsers();
        seedMachines();
        seedTickets();
        seedInventory();
        seedProcurementTickets();
        seedIssues();

        log.info("Seed data initialized successfully");
    }

    private void seedUsers() {
        // Passwords aligned with frontend DEMO_ACCOUNTS — all use "Password1!"
        String pw = passwordEncoder.encode("Password1!");
        userRepository.saveAll(List.of(
                User.builder().empId("ADM-001").name("System Administrator").role("admin")
                        .email("admin@tcs.com").password(pw).build(),
                User.builder().empId("MGR-001").name("Raj Sharma").role("manager")
                        .email("man@tcs.com").password(pw).build(),
                User.builder().empId("SUP-001").name("Priya Singh").role("supervisor")
                        .email("super@tcs.com").password(pw).build(),
                User.builder().empId("TECH-001").name("Amit Kumar").role("technician")
                        .email("tech@tcs.com").password(pw).build(),
                User.builder().empId("MAIN-001").name("Sita Devi").role("maintenance_supervisor")
                        .email("maintenance@tcs.com").password(pw).build(),
                User.builder().empId("MAIN-002").name("Vikram Nair").role("maintenance_manager")
                        .email("maintmgr@tcs.com").password(pw).build(),
                User.builder().empId("PROC-001").name("Ravi Patel").role("procurement")
                        .email("procurement@tcs.com").password(pw).build(),
                User.builder().empId("INV-001").name("Meena Joshi").role("inventory")
                        .email("inventory@tcs.com").password(pw).build()
        ));
        log.info("Seeded 8 demo users (all password: Password1!)");
    }

    private void seedMachines() {
        machineRepository.saveAll(List.of(
                Machine.builder().id("MCH-001").name("CNC Lathe #1").status(Machine.MachineStatus.Active)
                        .hours(1240).thresholdHours(1500).location("Floor A").build(),
                Machine.builder().id("MCH-002").name("Drill Press #2").status(Machine.MachineStatus.Maintenance)
                        .hours(950).thresholdHours(900).location("Floor B").build(),
                Machine.builder().id("MCH-003").name("Welding Station").status(Machine.MachineStatus.Active)
                        .hours(2100).thresholdHours(3000).location("Floor A").build(),
                Machine.builder().id("MCH-004").name("Hydraulic Press").status(Machine.MachineStatus.Inactive)
                        .hours(450).thresholdHours(2000).location("Floor C").build(),
                Machine.builder().id("MCH-005").name("Conveyor Belt #1").status(Machine.MachineStatus.Active)
                        .hours(3200).thresholdHours(5000).location("Floor B").build()
        ));
        log.info("Seeded 5 machines");
    }

    private void seedTickets() {
        ticketRepository.saveAll(List.of(
                Ticket.builder()
                        .id("TKT-001").priority(Ticket.Priority.High)
                        .status(Ticket.TicketStatus.Open).approvalStatus(Ticket.ApprovalStatus.Approved)
                        .currentDepartment("Maintenance").department("Production")
                        .description("CNC Lathe #1 vibration issue — needs immediate inspection")
                        .assignedTechnician("TECH-001").build(),
                Ticket.builder()
                        .id("TKT-002").priority(Ticket.Priority.Medium)
                        .status(Ticket.TicketStatus.Pending).approvalStatus(Ticket.ApprovalStatus.Pending)
                        .currentDepartment("Electrical").department("Assembly")
                        .description("Panel board tripping intermittently on Floor B").build(),
                Ticket.builder()
                        .id("TKT-003").priority(Ticket.Priority.Low)
                        .status(Ticket.TicketStatus.Closed).approvalStatus(Ticket.ApprovalStatus.Approved)
                        .currentDepartment("Quality").department("Quality")
                        .description("Calibration check for measurement instruments")
                        .isClosable(true).build()
        ));
        log.info("Seeded 3 tickets");
    }

    private void seedInventory() {
        inventoryRepository.saveAll(List.of(
                InventoryItem.builder().category("Lubricants").name("Engine Oil 5W-30")
                        .qty(45).threshold(20).unit("litres").location("Warehouse-A").build(),
                InventoryItem.builder().category("Bearings").name("Ball Bearing 6205")
                        .qty(8).threshold(15).unit("pcs").location("Shelf-B2").build(),
                InventoryItem.builder().category("Electrical").name("MCB 32A")
                        .qty(12).threshold(10).unit("pcs").location("Electrical Room").build(),
                InventoryItem.builder().category("Fasteners").name("M10 Hex Bolt")
                        .qty(3).threshold(50).unit("pcs").location("Shelf-C1").build(),
                InventoryItem.builder().category("Filters").name("Hydraulic Filter")
                        .qty(6).threshold(10).unit("pcs").location("Warehouse-B").build(),
                InventoryItem.builder().category("Lubricants").name("Grease NLGI-2")
                        .qty(22).threshold(10).unit("kg").location("Warehouse-A").build(),
                InventoryItem.builder().category("Seals").name("O-Ring Kit")
                        .qty(35).threshold(20).unit("sets").location("Shelf-A3").build(),
                InventoryItem.builder().category("Electrical").name("Contactor 25A")
                        .qty(4).threshold(5).unit("pcs").location("Electrical Room").build()
        ));
        log.info("Seeded 8 inventory items");
    }

    private void seedProcurementTickets() {
        procurementTicketRepository.saveAll(List.of(
                ProcurementTicket.builder().name("Steel Rod 20mm").type("Raw Material")
                        .department("Production").priority("High").status(ProcurementTicket.TicketStatus.Open)
                        .createdAtDisplay("12 May 2025")
                        .description("Steel rod required for new batch — 500kg needed").build(),
                ProcurementTicket.builder().name("Lubricant Oil 5L").type("Consumable")
                        .department("Maintenance").priority("Medium").status(ProcurementTicket.TicketStatus.Open)
                        .createdAtDisplay("13 May 2025")
                        .description("Running low on lubricant for CNC machines").build(),
                ProcurementTicket.builder().name("Bearing 6205").type("Spare Part")
                        .department("Maintenance").priority("High").status(ProcurementTicket.TicketStatus.Pending)
                        .createdAtDisplay("14 May 2025")
                        .description("Replacement bearings for MCH-002").sentToExternal(true).build(),
                ProcurementTicket.builder().name("Hydraulic Pump").type("Equipment")
                        .department("Engineering").priority("Low").status(ProcurementTicket.TicketStatus.Open)
                        .createdAtDisplay("15 May 2025")
                        .description("Backup hydraulic pump for contingency").build(),
                ProcurementTicket.builder().name("Carton Box 12x12").type("Packaging")
                        .department("Dispatch").priority("Medium").status(ProcurementTicket.TicketStatus.Closed)
                        .createdAtDisplay("16 May 2025")
                        .description("Monthly packaging material replenishment").build()
        ));
        log.info("Seeded 5 procurement tickets");
    }

    private void seedIssues() {
        issueRepository.saveAll(List.of(
                MaintenanceIssue.builder().machine("MCH-001").type("Mechanical")
                        .description("Excessive vibration during operation at high RPM")
                        .severity("High").date("2025-05-10")
                        .status(MaintenanceIssue.IssueStatus.Open).reportedBy("MAIN-001").build(),
                MaintenanceIssue.builder().machine("MCH-002").type("Electrical")
                        .description("Motor control board shows fault code E04")
                        .severity("Medium").date("2025-05-12")
                        .status(MaintenanceIssue.IssueStatus.In_Progress).reportedBy("TECH-001").build(),
                MaintenanceIssue.builder().machine("MCH-003").type("Hydraulic")
                        .description("Minor oil seepage near pressure valve")
                        .severity("Low").date("2025-05-15")
                        .status(MaintenanceIssue.IssueStatus.Open).reportedBy("MAIN-001").build()
        ));
        log.info("Seeded 3 issues");
    }
}

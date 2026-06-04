package com.manuvya.shopfloor.repository;

import com.manuvya.shopfloor.entity.MaintenanceIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceIssueRepository extends JpaRepository<MaintenanceIssue, Long> {
    List<MaintenanceIssue> findByMachine(String machine);
    List<MaintenanceIssue> findByStatus(MaintenanceIssue.IssueStatus status);
    long countByStatus(MaintenanceIssue.IssueStatus status);
}

package com.manuvya.shopfloor.repository;

import com.manuvya.shopfloor.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineRepository extends JpaRepository<Machine, String> {
    List<Machine> findByStatus(Machine.MachineStatus status);
    long countByStatus(Machine.MachineStatus status);
}

package com.manuvya.shopfloor.repository;

import com.manuvya.shopfloor.entity.MachineUseHour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MachineUseHourRepository extends JpaRepository<MachineUseHour, Long> {
    List<MachineUseHour> findByMachineOrderByDateDesc(String machine);
    List<MachineUseHour> findByLoggedBy(String loggedBy);
}

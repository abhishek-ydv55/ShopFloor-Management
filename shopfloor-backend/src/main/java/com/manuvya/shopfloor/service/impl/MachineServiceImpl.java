package com.manuvya.shopfloor.service.impl;

import com.manuvya.shopfloor.dto.request.MachineRequest;
import com.manuvya.shopfloor.dto.request.MachineUseHourRequest;
import com.manuvya.shopfloor.dto.response.MachineResponse;
import com.manuvya.shopfloor.dto.response.MachineStatsResponse;
import com.manuvya.shopfloor.dto.response.MachineUseHourResponse;
import com.manuvya.shopfloor.entity.Machine;
import com.manuvya.shopfloor.entity.MachineUseHour;
import com.manuvya.shopfloor.exception.BusinessException;
import com.manuvya.shopfloor.exception.ResourceNotFoundException;
import com.manuvya.shopfloor.repository.MachineRepository;
import com.manuvya.shopfloor.repository.MachineUseHourRepository;
import com.manuvya.shopfloor.service.MachineService;
import com.manuvya.shopfloor.service.MaintenanceTicketService;
import com.manuvya.shopfloor.util.IdGeneratorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class MachineServiceImpl implements MachineService {

    private final MachineRepository machineRepository;
    private final MachineUseHourRepository useHourRepository;
    private final MaintenanceTicketService maintenanceTicketService;

    @Override
    public MachineResponse createMachine(MachineRequest request) {
        Machine machine = Machine.builder()
                .id(request.getId() != null && !request.getId().isBlank()
                        ? request.getId()
                        : IdGeneratorUtil.generateMachineId())
                .name(request.getName())
                .status(Machine.MachineStatus.valueOf(request.getStatus()))
                .hours(0)
                .thresholdHours(request.getThresholdHours())
                .location(request.getLocation())
                .build();
        return toResponse(machineRepository.save(machine));
    }

    @Override
    @Transactional(readOnly = true)
    public MachineResponse getMachineById(String id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MachineResponse> getAllMachines() {
        return machineRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public MachineResponse updateMachine(String id, MachineRequest request) {
        Machine machine = findById(id);
        machine.setName(request.getName());
        try {
            machine.setStatus(Machine.MachineStatus.valueOf(request.getStatus()));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid machine status: " + request.getStatus());
        }
        machine.setThresholdHours(request.getThresholdHours());
        machine.setLocation(request.getLocation());
        return toResponse(machineRepository.save(machine));
    }

    @Override
    public void deleteMachine(String id) {
        machineRepository.delete(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public MachineStatsResponse getMachineStats() {
        long total = machineRepository.count();
        long active = machineRepository.countByStatus(Machine.MachineStatus.Active);
        long maintenance = machineRepository.countByStatus(Machine.MachineStatus.Maintenance);
        long inactive = machineRepository.countByStatus(Machine.MachineStatus.Inactive);
        long totalHours = machineRepository.findAll().stream().mapToLong(Machine::getHours).sum();
        return MachineStatsResponse.builder()
                .total(total).active(active).maintenance(maintenance)
                .inactive(inactive).totalHours(totalHours)
                .build();
    }

    @Override
    public MachineUseHourResponse logMachineHours(MachineUseHourRequest request) {
        MachineUseHour log = MachineUseHour.builder()
                .machine(request.getMachine())
                .hours(request.getHours())
                .date(request.getDate())
                .loggedBy(request.getLoggedBy())
                .build();
        MachineUseHour saved = useHourRepository.save(log);

        machineRepository.findById(request.getMachine()).ifPresent(m -> {
            int updatedHours = m.getHours() + request.getHours();
            m.setHours(updatedHours);
            if (m.getThresholdHours() > 0
                    && updatedHours >= m.getThresholdHours()
                    && m.getStatus() == Machine.MachineStatus.Active) {
                m.setStatus(Machine.MachineStatus.Maintenance);
                machineRepository.save(m);
                maintenanceTicketService.createTicketIfNotExists(
                        m.getId(), m.getName(), updatedHours, m.getThresholdHours());
            } else {
                machineRepository.save(m);
            }
        });

        return toHourResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MachineUseHourResponse> getHoursByMachine(String machine) {
        return useHourRepository.findByMachineOrderByDateDesc(machine)
                .stream().map(this::toHourResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MachineUseHourResponse> getAllHourLogs() {
        return useHourRepository.findAll().stream().map(this::toHourResponse).toList();
    }

    @Override
    public MachineResponse resetMachineHours(String id) {
        Machine machine = findById(id);
        machine.setHours(0);
        if (machine.getStatus() == Machine.MachineStatus.Maintenance) {
            machine.setStatus(Machine.MachineStatus.Active);
        }
        return toResponse(machineRepository.save(machine));
    }

    private Machine findById(String id) {
        return machineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Machine", "id", id));
    }

    private MachineResponse toResponse(Machine m) {
        return MachineResponse.builder()
                .id(m.getId()).name(m.getName())
                .status(m.getStatus().name())
                .hours(m.getHours())
                .thresholdHours(m.getThresholdHours())
                .location(m.getLocation())
                .build();
    }

    private MachineUseHourResponse toHourResponse(MachineUseHour h) {
        return MachineUseHourResponse.builder()
                .id(h.getId()).machine(h.getMachine())
                .hours(h.getHours()).date(h.getDate()).loggedBy(h.getLoggedBy())
                .build();
    }
}

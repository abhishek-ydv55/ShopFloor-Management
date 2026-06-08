package com.manuvya.shopfloor.service;

import com.manuvya.shopfloor.dto.request.MachineRequest;
import com.manuvya.shopfloor.dto.request.MachineUseHourRequest;
import com.manuvya.shopfloor.dto.response.MachineResponse;
import com.manuvya.shopfloor.dto.response.MachineStatsResponse;
import com.manuvya.shopfloor.dto.response.MachineUseHourResponse;

import java.util.List;

public interface MachineService {
    MachineResponse createMachine(MachineRequest request);
    MachineResponse getMachineById(String id);
    List<MachineResponse> getAllMachines();
    MachineResponse updateMachine(String id, MachineRequest request);
    void deleteMachine(String id);
    MachineStatsResponse getMachineStats();

    MachineUseHourResponse logMachineHours(MachineUseHourRequest request);
    List<MachineUseHourResponse> getHoursByMachine(String machine);
    List<MachineUseHourResponse> getAllHourLogs();
    MachineResponse resetMachineHours(String id);
}

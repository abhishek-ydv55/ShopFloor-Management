package com.manuvya.shopfloor.service;

import com.manuvya.shopfloor.dto.request.WorkerRequest;
import com.manuvya.shopfloor.dto.response.WorkerResponse;

import java.util.List;

public interface WorkerService {
    WorkerResponse createWorker(WorkerRequest request);
    WorkerResponse getWorkerByEmpId(String empId);
    List<WorkerResponse> getAllWorkers();
    List<WorkerResponse> getWorkersByRole(String role);
    WorkerResponse updateWorker(String empId, WorkerRequest request);
    void deleteWorker(String empId);
    void toggleWorkerStatus(String empId);
}

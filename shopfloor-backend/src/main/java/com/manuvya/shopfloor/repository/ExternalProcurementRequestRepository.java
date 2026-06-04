package com.manuvya.shopfloor.repository;

import com.manuvya.shopfloor.entity.ExternalProcurementRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExternalProcurementRequestRepository extends JpaRepository<ExternalProcurementRequest, Long> {
    List<ExternalProcurementRequest> findByStatus(ExternalProcurementRequest.RequestStatus status);
    boolean existsByRequestCode(String requestCode);
    boolean existsByNameIgnoreCaseAndStatus(String name, ExternalProcurementRequest.RequestStatus status);
    void deleteByStatusIn(java.util.List<ExternalProcurementRequest.RequestStatus> statuses);
}

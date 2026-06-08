package com.manuvya.shopfloor.repository;

import com.manuvya.shopfloor.entity.InternalProcurementRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternalProcurementRequestRepository extends JpaRepository<InternalProcurementRequest, Long> {
    List<InternalProcurementRequest> findByRequestedBy(String requestedBy);
    List<InternalProcurementRequest> findByStatus(InternalProcurementRequest.RequestStatus status);
    boolean existsByRequestCode(String requestCode);
    long countByStatus(InternalProcurementRequest.RequestStatus status);
    boolean existsByItemIgnoreCaseAndStatus(String item, InternalProcurementRequest.RequestStatus status);
    List<InternalProcurementRequest> findAllByOrderByCreatedAtDesc();
    void deleteByStatusIn(java.util.List<InternalProcurementRequest.RequestStatus> statuses);
}

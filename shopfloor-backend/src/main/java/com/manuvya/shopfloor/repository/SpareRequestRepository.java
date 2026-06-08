package com.manuvya.shopfloor.repository;

import com.manuvya.shopfloor.entity.SpareRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpareRequestRepository extends JpaRepository<SpareRequest, Long> {
    List<SpareRequest> findByRequestedBy(String requestedBy);
    List<SpareRequest> findByStatus(SpareRequest.RequestStatus status);
    boolean existsByRequestCode(String requestCode);
    long countByStatus(SpareRequest.RequestStatus status);
    void deleteByStatusIn(java.util.List<SpareRequest.RequestStatus> statuses);
}

package com.manuvya.shopfloor.service.impl;

import com.manuvya.shopfloor.dto.request.SpareRequestDto;
import com.manuvya.shopfloor.dto.response.SpareRequestResponse;
import com.manuvya.shopfloor.entity.ExternalProcurementRequest;
import com.manuvya.shopfloor.entity.InventoryItem;
import com.manuvya.shopfloor.entity.SpareRequest;
import com.manuvya.shopfloor.exception.BusinessException;
import com.manuvya.shopfloor.exception.ResourceNotFoundException;
import com.manuvya.shopfloor.repository.ExternalProcurementRequestRepository;
import com.manuvya.shopfloor.repository.InventoryItemRepository;
import com.manuvya.shopfloor.repository.SpareRequestRepository;
import com.manuvya.shopfloor.service.SpareRequestService;
import com.manuvya.shopfloor.util.DateUtil;
import com.manuvya.shopfloor.util.IdGeneratorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SpareRequestServiceImpl implements SpareRequestService {

    private final SpareRequestRepository spareRequestRepository;
    private final ExternalProcurementRequestRepository externalRepository;
    private final InventoryItemRepository inventoryRepository;

    @Override
    public SpareRequestResponse createRequest(SpareRequestDto request) {
        SpareRequest entity = SpareRequest.builder()
                .requestCode(IdGeneratorUtil.generateRequestCode("SPR"))
                .item(request.getItem())
                .qty(request.getQty())
                .machine(request.getMachine())
                .priority(SpareRequest.Priority.valueOf(request.getPriority()))
                .requestedBy(request.getRequestedBy())
                .notes(request.getNotes())
                .status(SpareRequest.RequestStatus.Pending)
                .build();
        return toResponse(spareRequestRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public SpareRequestResponse getRequestById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpareRequestResponse> getAllRequests() {
        return spareRequestRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpareRequestResponse> getRequestsByStatus(String status) {
        SpareRequest.RequestStatus rs;
        try {
            rs = SpareRequest.RequestStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status: " + status);
        }
        return spareRequestRepository.findByStatus(rs).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpareRequestResponse> getRequestsByUser(String empId) {
        return spareRequestRepository.findByRequestedBy(empId).stream().map(this::toResponse).toList();
    }

    @Override
    public SpareRequestResponse updateStatus(Long id, String status) {
        SpareRequest req = findById(id);
        SpareRequest.RequestStatus newStatus;
        try {
            newStatus = SpareRequest.RequestStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status: " + status);
        }
        req.setStatus(newStatus);
        return toResponse(spareRequestRepository.save(req));
    }

    /**
     * Procurement team verified stock is available – forward to inventory.
     * Status: Approved → ProcurementApproved
     */
    @Override
    public SpareRequestResponse procurementApprove(Long id) {
        SpareRequest req = findById(id);
        if (req.getStatus() != SpareRequest.RequestStatus.Approved) {
            throw new BusinessException("Only Manager-Approved requests can be processed by Procurement");
        }
        req.setStatus(SpareRequest.RequestStatus.ProcurementApproved);
        return toResponse(spareRequestRepository.save(req));
    }

    /**
     * Procurement team found item out of stock – raise external procurement request.
     * Status: Approved → SentToExternal
     */
    @Override
    public SpareRequestResponse procurementSendToExternal(Long id) {
        SpareRequest req = findById(id);
        if (req.getStatus() != SpareRequest.RequestStatus.Approved) {
            throw new BusinessException("Only Manager-Approved requests can be sent to external procurement");
        }

        ExternalProcurementRequest ext = ExternalProcurementRequest.builder()
                .requestCode(IdGeneratorUtil.generateRequestCode("EXT"))
                .name(req.getItem())
                .department("Maintenance")
                .priority(req.getPriority().name())
                .status(ExternalProcurementRequest.RequestStatus.Pending)
                .requestedDate(DateUtil.todayDisplay())
                .build();
        externalRepository.save(ext);

        req.setStatus(SpareRequest.RequestStatus.SentToExternal);
        return toResponse(spareRequestRepository.save(req));
    }

    /**
     * Inventory team — item not in stock, raise external procurement request.
     * Status: ProcurementApproved → SentToExternal
     */
    @Override
    public SpareRequestResponse inventorySendToExternal(Long id) {
        SpareRequest req = findById(id);
        if (req.getStatus() != SpareRequest.RequestStatus.ProcurementApproved) {
            throw new BusinessException("Only Procurement-Approved requests can be sent to external procurement");
        }

        ExternalProcurementRequest ext = ExternalProcurementRequest.builder()
                .requestCode(IdGeneratorUtil.generateRequestCode("EXT"))
                .name(req.getItem())
                .department("Inventory")
                .priority(req.getPriority().name())
                .status(ExternalProcurementRequest.RequestStatus.Pending)
                .requestedDate(DateUtil.todayDisplay())
                .build();
        externalRepository.save(ext);

        req.setStatus(SpareRequest.RequestStatus.SentToExternal);
        return toResponse(spareRequestRepository.save(req));
    }

    /**
     * Inventory team deducts the item from stock and closes the request.
     * Status: ProcurementApproved → Fulfilled
     */
    @Override
    public SpareRequestResponse fulfillRequest(Long id) {
        SpareRequest req = findById(id);
        if (req.getStatus() != SpareRequest.RequestStatus.ProcurementApproved) {
            throw new BusinessException("Only Procurement-Approved requests can be fulfilled by Inventory");
        }

        InventoryItem item = inventoryRepository.findAll().stream()
                .filter(i -> i.getName().equalsIgnoreCase(req.getItem()))
                .findFirst()
                .orElseThrow(() -> new BusinessException(
                        "Item '" + req.getItem() + "' not found in inventory."));

        if (item.getQty() < req.getQty()) {
            throw new BusinessException("Insufficient stock: " + item.getQty()
                    + " available, " + req.getQty() + " requested.");
        }

        item.setQty(item.getQty() - req.getQty());
        inventoryRepository.save(item);

        req.setStatus(SpareRequest.RequestStatus.Fulfilled);
        return toResponse(spareRequestRepository.save(req));
    }

    @Override
    public void deleteRequest(Long id) {
        spareRequestRepository.delete(findById(id));
    }

    @Override
    public void deleteCompleted() {
        spareRequestRepository.deleteByStatusIn(List.of(
                SpareRequest.RequestStatus.Fulfilled,
                SpareRequest.RequestStatus.SentToExternal,
                SpareRequest.RequestStatus.Rejected));
    }

    private SpareRequest findById(Long id) {
        return spareRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SpareRequest", "id", id));
    }

    private SpareRequestResponse toResponse(SpareRequest r) {
        return SpareRequestResponse.builder()
                .id(r.getId()).requestCode(r.getRequestCode())
                .item(r.getItem()).qty(r.getQty()).machine(r.getMachine())
                .priority(r.getPriority().name()).status(r.getStatus().name())
                .requestedBy(r.getRequestedBy()).notes(r.getNotes())
                .createdAt(DateUtil.toDisplayString(r.getCreatedAt()))
                .build();
    }
}

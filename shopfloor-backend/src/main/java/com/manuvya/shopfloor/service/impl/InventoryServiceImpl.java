package com.manuvya.shopfloor.service.impl;

import com.manuvya.shopfloor.dto.response.InventoryItemResponse;
import com.manuvya.shopfloor.entity.ExternalProcurementRequest;
import com.manuvya.shopfloor.entity.InternalProcurementRequest;
import com.manuvya.shopfloor.entity.InventoryItem;
import com.manuvya.shopfloor.exception.ResourceNotFoundException;
import com.manuvya.shopfloor.repository.ExternalProcurementRequestRepository;
import com.manuvya.shopfloor.repository.InternalProcurementRequestRepository;
import com.manuvya.shopfloor.repository.InventoryItemRepository;
import com.manuvya.shopfloor.service.InventoryService;
import com.manuvya.shopfloor.util.DateUtil;
import com.manuvya.shopfloor.util.IdGeneratorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryServiceImpl implements InventoryService {

    private final InventoryItemRepository inventoryRepository;
    private final InternalProcurementRequestRepository internalProcurementRequestRepository;
    private final ExternalProcurementRequestRepository externalProcurementRequestRepository;

    @Override
    public InventoryItemResponse addItem(InventoryItem item) {
        InventoryItem saved = inventoryRepository.save(item);
        if (saved.getQty() < saved.getThreshold()) {
            autoCreateProcurementRequest(saved);
        }
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryItemResponse getItemById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getAllItems() {
        return inventoryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getLowStockItems() {
        return inventoryRepository.findLowStockItems().stream().map(this::toResponse).toList();
    }

    @Override
    public InventoryItemResponse updateItem(Long id, InventoryItem item) {
        InventoryItem existing = findById(id);
        existing.setCategory(item.getCategory());
        existing.setName(item.getName());
        existing.setQty(item.getQty());
        existing.setThreshold(item.getThreshold());
        existing.setUnit(item.getUnit());
        existing.setLocation(item.getLocation());
        InventoryItem saved = inventoryRepository.save(existing);
        if (saved.getQty() < saved.getThreshold()) {
            autoCreateProcurementRequest(saved);
        }
        return toResponse(saved);
    }

    @Override
    public InventoryItemResponse updateQty(Long id, int qty) {
        InventoryItem item = findById(id);
        item.setQty(qty);
        InventoryItem saved = inventoryRepository.save(item);
        if (saved.getQty() < saved.getThreshold()) {
            autoCreateProcurementRequest(saved);
        }
        return toResponse(saved);
    }

    @Override
    public void deleteItem(Long id) {
        inventoryRepository.delete(findById(id));
    }

    private void autoCreateProcurementRequest(InventoryItem item) {
        // Skip if a pending external request already exists for this item to avoid duplicates
        boolean hasPendingExternal = externalProcurementRequestRepository
                .existsByNameIgnoreCaseAndStatus(item.getName(), ExternalProcurementRequest.RequestStatus.Pending);
        if (hasPendingExternal) return;

        int deficit = item.getThreshold() - item.getQty();
        InternalProcurementRequest.Priority priority = item.getQty() == 0
                ? InternalProcurementRequest.Priority.High
                : InternalProcurementRequest.Priority.Medium;

        // Auto-approved internal request kept for audit trail in Procurement Request log
        internalProcurementRequestRepository.save(InternalProcurementRequest.builder()
                .requestCode(IdGeneratorUtil.generateRequestCode("INV"))
                .item(item.getName())
                .qty(deficit > 0 ? deficit : 1)
                .dept("Inventory")
                .priority(priority)
                .requestedBy("AUTO-INVENTORY")
                .status(InternalProcurementRequest.RequestStatus.Approved)
                .build());

        // Route directly to external procurement — no manual approval step required
        externalProcurementRequestRepository.save(ExternalProcurementRequest.builder()
                .requestCode(IdGeneratorUtil.generateRequestCode("EXT"))
                .name(item.getName())
                .department("Inventory")
                .priority(priority.name())
                .status(ExternalProcurementRequest.RequestStatus.Pending)
                .requestedDate(DateUtil.todayDisplay())
                .build());
    }

    private InventoryItem findById(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));
    }

    private InventoryItemResponse toResponse(InventoryItem i) {
        return InventoryItemResponse.builder()
                .id(i.getId()).category(i.getCategory()).name(i.getName())
                .qty(i.getQty()).threshold(i.getThreshold())
                .unit(i.getUnit()).location(i.getLocation())
                .build();
    }
}

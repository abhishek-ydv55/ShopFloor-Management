package com.manuvya.shopfloor.service.impl;

import com.manuvya.shopfloor.dto.request.ProcurementTicketRequest;
import com.manuvya.shopfloor.dto.response.ExternalRequestResponse;
import com.manuvya.shopfloor.dto.response.InternalRequestResponse;
import com.manuvya.shopfloor.dto.response.ProcurementTicketResponse;
import com.manuvya.shopfloor.entity.ExternalProcurementRequest;
import com.manuvya.shopfloor.entity.InternalProcurementRequest;
import com.manuvya.shopfloor.entity.ProcurementTicket;
import com.manuvya.shopfloor.entity.SpareRequest;
import com.manuvya.shopfloor.exception.BusinessException;
import com.manuvya.shopfloor.exception.ResourceNotFoundException;
import com.manuvya.shopfloor.repository.ExternalProcurementRequestRepository;
import com.manuvya.shopfloor.repository.InternalProcurementRequestRepository;
import com.manuvya.shopfloor.repository.ProcurementTicketRepository;
import com.manuvya.shopfloor.repository.SpareRequestRepository;
import com.manuvya.shopfloor.service.ProcurementService;
import com.manuvya.shopfloor.util.DateUtil;
import com.manuvya.shopfloor.util.IdGeneratorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProcurementServiceImpl implements ProcurementService {

    private final ProcurementTicketRepository ticketRepository;
    private final InternalProcurementRequestRepository internalRepository;
    private final ExternalProcurementRequestRepository externalRepository;
    private final SpareRequestRepository spareRequestRepository;

    @Override
    public ProcurementTicketResponse createTicket(ProcurementTicketRequest request) {
        ProcurementTicket ticket = ProcurementTicket.builder()
                .name(request.getName())
                .type(request.getType())
                .department(request.getDepartment())
                .priority(request.getPriority())
                .status(ProcurementTicket.TicketStatus.Open)
                .createdAtDisplay(DateUtil.todayDisplay())
                .description(request.getDescription())
                .build();
        return toTicketResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcurementTicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream().map(this::toTicketResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProcurementTicketResponse getTicketById(Long id) {
        return toTicketResponse(findTicketById(id));
    }

    @Override
    public ProcurementTicketResponse addRemark(Long ticketId, String remark) {
        ProcurementTicket ticket = findTicketById(ticketId);
        ticket.setRemark(remark);
        return toTicketResponse(ticketRepository.save(ticket));
    }

    @Override
    public ProcurementTicketResponse sendToExternal(Long ticketId) {
        ProcurementTicket ticket = findTicketById(ticketId);
        if (ticket.isSentToExternal()) {
            throw new BusinessException("Ticket already sent to external procurement");
        }
        ticket.setSentToExternal(true);

        ExternalProcurementRequest ext = ExternalProcurementRequest.builder()
                .requestCode(IdGeneratorUtil.generateRequestCode("EXT"))
                .procurementTicket(ticket)
                .name(ticket.getName())
                .department(ticket.getDepartment())
                .priority(ticket.getPriority())
                .status(ExternalProcurementRequest.RequestStatus.Pending)
                .requestedDate(DateUtil.todayDisplay())
                .build();
        externalRepository.save(ext);

        return toTicketResponse(ticketRepository.save(ticket));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcurementTicketResponse> getExternalTickets() {
        return ticketRepository.findBySentToExternalTrue().stream().map(this::toTicketResponse).toList();
    }

    @Override
    public InternalRequestResponse createInternalRequest(
            com.manuvya.shopfloor.dto.request.InternalProcurementRequest request) {
        InternalProcurementRequest entity = InternalProcurementRequest.builder()
                .requestCode(IdGeneratorUtil.generateRequestCode("INT"))
                .item(request.getItem())
                .qty(request.getQty())
                .dept(request.getDept())
                .priority(InternalProcurementRequest.Priority.valueOf(request.getPriority()))
                .requestedBy(request.getRequestedBy())
                .status(InternalProcurementRequest.RequestStatus.Pending)
                .build();
        return toInternalResponse(internalRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InternalRequestResponse> getAllInternalRequests() {
        return internalRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toInternalResponse).toList();
    }

    @Override
    public InternalRequestResponse approveInternalRequest(Long id) {
        InternalProcurementRequest req = internalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InternalRequest", "id", id));
        if (req.getStatus() != InternalProcurementRequest.RequestStatus.Pending) {
            throw new BusinessException("Request is not in Pending status");
        }
        req.setStatus(InternalProcurementRequest.RequestStatus.Approved);
        InternalProcurementRequest saved = internalRepository.save(req);

        // Always forward to Inventory team — they check stock and fulfill
        spareRequestRepository.save(SpareRequest.builder()
                .requestCode(IdGeneratorUtil.generateRequestCode("PRO"))
                .item(req.getItem())
                .qty(req.getQty())
                .machine(req.getDept())
                .priority(SpareRequest.Priority.valueOf(req.getPriority().name()))
                .requestedBy(req.getRequestedBy())
                .notes("Procurement request: " + req.getRequestCode())
                .status(SpareRequest.RequestStatus.ProcurementApproved)
                .build());

        return toInternalResponse(saved);
    }

    @Override
    public InternalRequestResponse updateInternalRequestStatus(Long id, String status) {
        InternalProcurementRequest req = internalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InternalRequest", "id", id));
        try {
            req.setStatus(InternalProcurementRequest.RequestStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status: " + status);
        }
        return toInternalResponse(internalRepository.save(req));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExternalRequestResponse> getAllExternalRequests() {
        return externalRepository.findAll().stream().map(this::toExternalResponse).toList();
    }

    @Override
    public ExternalRequestResponse updateExternalRequestStatus(Long id, String status) {
        ExternalProcurementRequest req = externalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExternalRequest", "id", id));
        try {
            req.setStatus(ExternalProcurementRequest.RequestStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status: " + status);
        }
        return toExternalResponse(externalRepository.save(req));
    }

    @Override
    public void deleteProcurementTicket(Long id) {
        ticketRepository.delete(findTicketById(id));
    }

    @Override
    public void deleteInternalRequest(Long id) {
        InternalProcurementRequest req = internalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InternalRequest", "id", id));
        internalRepository.delete(req);
    }

    @Override
    public void deleteExternalRequest(Long id) {
        ExternalProcurementRequest req = externalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ExternalRequest", "id", id));
        externalRepository.delete(req);
    }

    @Override
    public void deleteCompletedTickets() {
        ticketRepository.deleteByStatus(ProcurementTicket.TicketStatus.Closed);
    }

    @Override
    public void deleteCompletedInternalRequests() {
        internalRepository.deleteByStatusIn(List.of(
                InternalProcurementRequest.RequestStatus.Approved,
                InternalProcurementRequest.RequestStatus.Rejected));
    }

    @Override
    public void deleteCompletedExternalRequests() {
        externalRepository.deleteByStatusIn(List.of(
                ExternalProcurementRequest.RequestStatus.Approved,
                ExternalProcurementRequest.RequestStatus.Rejected));
    }

    private ProcurementTicket findTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProcurementTicket", "id", id));
    }

    private ProcurementTicketResponse toTicketResponse(ProcurementTicket t) {
        return ProcurementTicketResponse.builder()
                .id(t.getId()).name(t.getName()).type(t.getType())
                .department(t.getDepartment()).priority(t.getPriority())
                .status(t.getStatus().name())
                .createdAtDisplay(t.getCreatedAtDisplay())
                .description(t.getDescription()).remark(t.getRemark())
                .sentToExternal(t.isSentToExternal())
                .build();
    }

    private InternalRequestResponse toInternalResponse(InternalProcurementRequest r) {
        return InternalRequestResponse.builder()
                .id(r.getId()).requestCode(r.getRequestCode())
                .item(r.getItem()).qty(r.getQty()).dept(r.getDept())
                .priority(r.getPriority().name()).status(r.getStatus().name())
                .requestedBy(r.getRequestedBy())
                .createdAt(DateUtil.toDisplayString(r.getCreatedAt()))
                .build();
    }

    private ExternalRequestResponse toExternalResponse(ExternalProcurementRequest e) {
        return ExternalRequestResponse.builder()
                .id(e.getId()).requestCode(e.getRequestCode())
                .procurementTicketId(e.getProcurementTicket() != null ? e.getProcurementTicket().getId() : null)
                .procurementTicketName(e.getProcurementTicket() != null ? e.getProcurementTicket().getName() : null)
                .name(e.getName()).department(e.getDepartment())
                .priority(e.getPriority()).status(e.getStatus().name())
                .requestedDate(e.getRequestedDate()).vendor(e.getVendor())
                .build();
    }
}

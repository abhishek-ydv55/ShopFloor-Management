package com.manuvya.shopfloor.service;

import com.manuvya.shopfloor.dto.request.IssueRequest;
import com.manuvya.shopfloor.dto.response.IssueResponse;

import java.util.List;

public interface IssueService {
    IssueResponse createIssue(IssueRequest request);
    IssueResponse getIssueById(Long id);
    List<IssueResponse> getAllIssues();
    List<IssueResponse> getIssuesByMachine(String machine);
    IssueResponse updateIssueStatus(Long id, String status);
    void deleteIssue(Long id);
}

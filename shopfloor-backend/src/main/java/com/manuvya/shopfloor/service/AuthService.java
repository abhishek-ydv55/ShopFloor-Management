package com.manuvya.shopfloor.service;

import com.manuvya.shopfloor.dto.request.LoginRequest;
import com.manuvya.shopfloor.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}

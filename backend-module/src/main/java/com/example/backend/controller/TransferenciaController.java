package com.example.backend.controller;

import com.example.backend.dto.TransferenciaRequest;
import com.example.backend.dto.TransferenciaResponse;
import com.example.backend.service.TransferenciaService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/transferencias")
public class TransferenciaController {

    private final TransferenciaService service;

    public TransferenciaController(TransferenciaService service) {
        this.service = service;
    }

    @PostMapping
    public TransferenciaResponse transferir(@Valid @RequestBody TransferenciaRequest request) {
        return service.transferir(request);
    }
}

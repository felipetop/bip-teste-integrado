package com.example.backend.controller;

import com.example.backend.dto.TransferenciaRequest;
import com.example.backend.dto.TransferenciaResponse;
import com.example.backend.exception.GlobalExceptionHandler;
import com.example.backend.service.BeneficioService;
import com.example.backend.service.TransferenciaService;
import com.example.ejb.exception.BeneficioInativoException;
import com.example.ejb.exception.SaldoInsuficienteException;
import com.example.ejb.exception.TransferenciaInvalidaException;
import com.example.ejb.service.BeneficioEjbService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TransferenciaController.class)
@Import(GlobalExceptionHandler.class)
class TransferenciaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransferenciaService service;

    @MockBean
    private BeneficioService beneficioService;

    @MockBean
    private BeneficioEjbService ejbService;

    @Test
    @DisplayName("POST /api/v1/transferencias retorna 200 com saldos atualizados")
    void transferir_caminhoFeliz() throws Exception {
        TransferenciaRequest req = new TransferenciaRequest(1L, 2L, new BigDecimal("100.00"));
        when(service.transferir(any(TransferenciaRequest.class))).thenReturn(
                new TransferenciaResponse(1L, 2L, new BigDecimal("100.00"), new BigDecimal("900.00"), new BigDecimal("600.00"))
        );

        mockMvc.perform(post("/api/v1/transferencias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fromId").value(1))
                .andExpect(jsonPath("$.toId").value(2))
                .andExpect(jsonPath("$.amount").value(100.00))
                .andExpect(jsonPath("$.saldoOrigem").value(900.00))
                .andExpect(jsonPath("$.saldoDestino").value(600.00));
    }

    @Test
    @DisplayName("POST /api/v1/transferencias retorna 422 quando saldo é insuficiente")
    void transferir_saldoInsuficiente() throws Exception {
        TransferenciaRequest req = new TransferenciaRequest(1L, 2L, new BigDecimal("99999.00"));
        when(service.transferir(any(TransferenciaRequest.class)))
                .thenThrow(new SaldoInsuficienteException(1L, new BigDecimal("100.00"), new BigDecimal("99999.00")));

        mockMvc.perform(post("/api/v1/transferencias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Saldo insuficiente"))
                .andExpect(jsonPath("$.status").value(422));
    }

    @Test
    @DisplayName("POST /api/v1/transferencias retorna 422 quando origem é igual ao destino")
    void transferir_mesmaOrigemDestino() throws Exception {
        TransferenciaRequest req = new TransferenciaRequest(1L, 1L, new BigDecimal("100.00"));
        when(service.transferir(any(TransferenciaRequest.class)))
                .thenThrow(new TransferenciaInvalidaException("origem e destino não podem ser o mesmo benefício"));

        mockMvc.perform(post("/api/v1/transferencias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Transferência inválida"));
    }

    @Test
    @DisplayName("POST /api/v1/transferencias retorna 422 quando benefício está inativo")
    void transferir_beneficioInativo() throws Exception {
        TransferenciaRequest req = new TransferenciaRequest(1L, 2L, new BigDecimal("100.00"));
        when(service.transferir(any(TransferenciaRequest.class)))
                .thenThrow(new BeneficioInativoException(1L));

        mockMvc.perform(post("/api/v1/transferencias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.title").value("Benefício inativo"));
    }

    @Test
    @DisplayName("POST /api/v1/transferencias retorna 400 com payload inválido (amount negativo)")
    void transferir_payloadInvalido() throws Exception {
        String json = "{\"fromId\":1,\"toId\":2,\"amount\":-50}";

        mockMvc.perform(post("/api/v1/transferencias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validação falhou"));
    }
}

package com.example.backend.controller;

import com.example.backend.dto.BeneficioRequest;
import com.example.backend.dto.BeneficioResponse;
import com.example.backend.exception.GlobalExceptionHandler;
import com.example.backend.service.BeneficioService;
import com.example.backend.service.TransferenciaService;
import com.example.ejb.exception.BeneficioNaoEncontradoException;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BeneficioController.class)
@Import(GlobalExceptionHandler.class)
class BeneficioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BeneficioService service;

    @MockBean
    private BeneficioEjbService ejbService;

    @MockBean
    private TransferenciaService transferenciaService;

    @Test
    @DisplayName("GET /api/v1/beneficios retorna lista de BeneficioResponse com campos completos")
    void listar_retornaListaDeBeneficios() throws Exception {
        when(service.listar()).thenReturn(List.of(
                new BeneficioResponse(1L, "Vale Refeição", "Crédito mensal", new BigDecimal("1000.00"), true),
                new BeneficioResponse(2L, "Vale Transporte", "Auxílio", new BigDecimal("500.00"), true)
        ));

        mockMvc.perform(get("/api/v1/beneficios"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nome").value("Vale Refeição"))
                .andExpect(jsonPath("$[0].descricao").value("Crédito mensal"))
                .andExpect(jsonPath("$[0].valor").value(1000.00))
                .andExpect(jsonPath("$[0].ativo").value(true))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].nome").value("Vale Transporte"))
                .andExpect(jsonPath("$[1].valor").value(500.00));
    }

    @Test
    @DisplayName("GET /api/v1/beneficios retorna lista vazia quando não há benefícios")
    void listar_retornaListaVaziaQuandoNaoHaBeneficios() throws Exception {
        when(service.listar()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/beneficios"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/v1/beneficios/{id} retorna benefício existente")
    void buscarPorId_existente() throws Exception {
        when(service.buscarPorId(1L)).thenReturn(
                new BeneficioResponse(1L, "Vale Refeição", "Crédito mensal", new BigDecimal("1000.00"), true)
        );

        mockMvc.perform(get("/api/v1/beneficios/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("Vale Refeição"));
    }

    @Test
    @DisplayName("GET /api/v1/beneficios/{id} retorna 404 quando inexistente")
    void buscarPorId_inexistente() throws Exception {
        when(service.buscarPorId(99L)).thenThrow(new BeneficioNaoEncontradoException(99L));

        mockMvc.perform(get("/api/v1/beneficios/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Benefício não encontrado"))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("POST /api/v1/beneficios cria benefício e retorna 201")
    void criar_valido() throws Exception {
        BeneficioRequest req = new BeneficioRequest("Vale Cultura", "Auxílio cultural", new BigDecimal("200.00"), true);
        when(service.criar(any(BeneficioRequest.class))).thenReturn(
                new BeneficioResponse(3L, "Vale Cultura", "Auxílio cultural", new BigDecimal("200.00"), true)
        );

        mockMvc.perform(post("/api/v1/beneficios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.nome").value("Vale Cultura"));
    }

    @Test
    @DisplayName("POST /api/v1/beneficios retorna 400 com payload inválido")
    void criar_invalido() throws Exception {
        BeneficioRequest req = new BeneficioRequest("", null, null, null);

        mockMvc.perform(post("/api/v1/beneficios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validação falhou"))
                .andExpect(jsonPath("$.erros").isArray());
    }

    @Test
    @DisplayName("PUT /api/v1/beneficios/{id} atualiza benefício existente")
    void atualizar_existente() throws Exception {
        BeneficioRequest req = new BeneficioRequest("Vale Refeição Atualizado", "Nova descrição", new BigDecimal("1200.00"), true);
        when(service.atualizar(eq(1L), any(BeneficioRequest.class))).thenReturn(
                new BeneficioResponse(1L, "Vale Refeição Atualizado", "Nova descrição", new BigDecimal("1200.00"), true)
        );

        mockMvc.perform(put("/api/v1/beneficios/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Vale Refeição Atualizado"))
                .andExpect(jsonPath("$.valor").value(1200.00));
    }

    @Test
    @DisplayName("PUT /api/v1/beneficios/{id} retorna 404 quando inexistente")
    void atualizar_inexistente() throws Exception {
        BeneficioRequest req = new BeneficioRequest("X", "Y", new BigDecimal("1.00"), true);
        when(service.atualizar(eq(99L), any(BeneficioRequest.class)))
                .thenThrow(new BeneficioNaoEncontradoException(99L));

        mockMvc.perform(put("/api/v1/beneficios/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/v1/beneficios/{id} retorna 204")
    void desativar_existente() throws Exception {
        mockMvc.perform(delete("/api/v1/beneficios/1"))
                .andExpect(status().isNoContent());

        verify(service).desativar(1L);
    }

    @Test
    @DisplayName("DELETE /api/v1/beneficios/{id} retorna 404 quando inexistente")
    void desativar_inexistente() throws Exception {
        doThrow(new BeneficioNaoEncontradoException(99L)).when(service).desativar(99L);

        mockMvc.perform(delete("/api/v1/beneficios/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Benefício não encontrado"));
    }
}

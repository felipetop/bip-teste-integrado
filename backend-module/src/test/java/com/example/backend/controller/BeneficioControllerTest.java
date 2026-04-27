package com.example.backend.controller;

import com.example.backend.dto.BeneficioResponse;
import com.example.backend.service.BeneficioService;
import com.example.ejb.service.BeneficioEjbService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BeneficioController.class)
class BeneficioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BeneficioService service;

    @MockBean
    private BeneficioEjbService ejbService;

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
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}

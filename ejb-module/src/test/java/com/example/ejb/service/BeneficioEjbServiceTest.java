package com.example.ejb.service;

import com.example.ejb.domain.Beneficio;
import com.example.ejb.exception.SaldoInsuficienteException;
import com.example.ejb.exception.TransferenciaInvalidaException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BeneficioEjbServiceTest {

    @Mock
    EntityManager em;

    @InjectMocks
    BeneficioEjbService service;

    @Test
    @DisplayName("Caminho feliz: debita origem e credita destino")
    void transferCaminhoFeliz() {
        Beneficio from = beneficio(1L, "1000.00");
        Beneficio to = beneficio(2L, "500.00");

        lenient().when(em.find(Beneficio.class, 1L)).thenReturn(from);
        lenient().when(em.find(Beneficio.class, 2L)).thenReturn(to);
        lenient().when(em.find(eq(Beneficio.class), eq(1L), any(LockModeType.class))).thenReturn(from);
        lenient().when(em.find(eq(Beneficio.class), eq(2L), any(LockModeType.class))).thenReturn(to);

        service.transfer(1L, 2L, new BigDecimal("200.00"));

        assertThat(from.getValor()).isEqualByComparingTo("800.00");
        assertThat(to.getValor()).isEqualByComparingTo("700.00");
    }

    @Test
    @DisplayName("Saldo insuficiente: lança SaldoInsuficienteException e mantém valores intactos")
    void transferSaldoInsuficiente() {
        Beneficio from = beneficio(1L, "100.00");
        Beneficio to = beneficio(2L, "500.00");

        lenient().when(em.find(Beneficio.class, 1L)).thenReturn(from);
        lenient().when(em.find(Beneficio.class, 2L)).thenReturn(to);
        lenient().when(em.find(eq(Beneficio.class), eq(1L), any(LockModeType.class))).thenReturn(from);
        lenient().when(em.find(eq(Beneficio.class), eq(2L), any(LockModeType.class))).thenReturn(to);

        assertThatThrownBy(() -> service.transfer(1L, 2L, new BigDecimal("500.00")))
                .isInstanceOf(SaldoInsuficienteException.class);

        assertThat(from.getValor()).isEqualByComparingTo("100.00");
        assertThat(to.getValor()).isEqualByComparingTo("500.00");
    }

    @ParameterizedTest(name = "amount = {0}")
    @NullSource
    @ValueSource(strings = {"0", "0.00", "-0.01", "-50.00"})
    @DisplayName("Valor inválido (null, zero ou negativo): lança TransferenciaInvalidaException antes de tocar no banco")
    void transferValorInvalido(BigDecimal amount) {
        assertThatThrownBy(() -> service.transfer(1L, 2L, amount))
                .isInstanceOf(TransferenciaInvalidaException.class);

        verify(em, never()).find(eq(Beneficio.class), any(Long.class));
        verify(em, never()).find(eq(Beneficio.class), any(Long.class), any(LockModeType.class));
    }

    @Test
    @DisplayName("Origem igual ao destino: lança TransferenciaInvalidaException antes de tocar no banco")
    void transferOrigemIgualDestino() {
        assertThatThrownBy(() -> service.transfer(1L, 1L, new BigDecimal("100.00")))
                .isInstanceOf(TransferenciaInvalidaException.class);

        verify(em, never()).find(eq(Beneficio.class), any(Long.class));
        verify(em, never()).find(eq(Beneficio.class), any(Long.class), any(LockModeType.class));
    }

    private Beneficio beneficio(Long id, String valor) {
        Beneficio b = new Beneficio("Beneficio " + id, "desc " + id, new BigDecimal(valor));
        b.setId(id);
        return b;
    }
}

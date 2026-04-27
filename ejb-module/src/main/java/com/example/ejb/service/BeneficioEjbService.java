package com.example.ejb.service;

import com.example.ejb.domain.Beneficio;
import com.example.ejb.exception.BeneficioInativoException;
import com.example.ejb.exception.BeneficioNaoEncontradoException;
import com.example.ejb.exception.SaldoInsuficienteException;
import com.example.ejb.exception.TransferenciaInvalidaException;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Objects;

@Stateless
@Service
public class BeneficioEjbService {

    @PersistenceContext
    private EntityManager em;

    @Transactional(rollbackFor = Exception.class)
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        validarParametros(fromId, toId, amount);

        Long firstId = Math.min(fromId, toId);
        Long secondId = Math.max(fromId, toId);
        Beneficio first = lockAndFind(firstId);
        Beneficio second = lockAndFind(secondId);

        Beneficio from = fromId.equals(firstId) ? first : second;
        Beneficio to = fromId.equals(firstId) ? second : first;

        validarAtivos(from, to);
        validarSaldo(from, amount);

        from.setValor(from.getValor().subtract(amount));
        to.setValor(to.getValor().add(amount));
    }

    private void validarParametros(Long fromId, Long toId, BigDecimal amount) {
        if (fromId == null || toId == null) {
            throw new TransferenciaInvalidaException("ids de origem e destino são obrigatórios");
        }
        if (Objects.equals(fromId, toId)) {
            throw new TransferenciaInvalidaException("origem e destino não podem ser o mesmo benefício");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new TransferenciaInvalidaException("valor deve ser positivo");
        }
    }

    private Beneficio lockAndFind(Long id) {
        Beneficio b = em.find(Beneficio.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (b == null) {
            throw new BeneficioNaoEncontradoException(id);
        }
        return b;
    }

    private void validarAtivos(Beneficio from, Beneficio to) {
        if (Boolean.FALSE.equals(from.getAtivo())) {
            throw new BeneficioInativoException(from.getId());
        }
        if (Boolean.FALSE.equals(to.getAtivo())) {
            throw new BeneficioInativoException(to.getId());
        }
    }

    private void validarSaldo(Beneficio from, BigDecimal amount) {
        if (from.getValor().compareTo(amount) < 0) {
            throw new SaldoInsuficienteException(from.getId(), from.getValor(), amount);
        }
    }
}

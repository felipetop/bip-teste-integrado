package com.example.backend.service;

import com.example.backend.dto.BeneficioRequest;
import com.example.backend.dto.BeneficioResponse;
import com.example.backend.repository.BeneficioRepository;
import com.example.ejb.domain.Beneficio;
import com.example.ejb.exception.BeneficioNaoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BeneficioService {

    private final BeneficioRepository repository;

    public BeneficioService(BeneficioRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<BeneficioResponse> listar() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BeneficioResponse buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new BeneficioNaoEncontradoException(id));
    }

    @Transactional
    public BeneficioResponse criar(BeneficioRequest req) {
        Beneficio b = new Beneficio(req.nome(), req.descricao(), req.valor());
        if (req.ativo() != null) {
            b.setAtivo(req.ativo());
        }
        return toResponse(repository.save(b));
    }

    @Transactional
    public BeneficioResponse atualizar(Long id, BeneficioRequest req) {
        Beneficio b = repository.findById(id)
                .orElseThrow(() -> new BeneficioNaoEncontradoException(id));
        b.setNome(req.nome());
        b.setDescricao(req.descricao());
        b.setValor(req.valor());
        if (req.ativo() != null) {
            b.setAtivo(req.ativo());
        }
        return toResponse(b);
    }

    @Transactional
    public void desativar(Long id) {
        Beneficio b = repository.findById(id)
                .orElseThrow(() -> new BeneficioNaoEncontradoException(id));
        b.setAtivo(false);
    }

    private BeneficioResponse toResponse(Beneficio b) {
        return new BeneficioResponse(
                b.getId(),
                b.getNome(),
                b.getDescricao(),
                b.getValor(),
                b.getAtivo()
        );
    }
}

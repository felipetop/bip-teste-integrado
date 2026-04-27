package com.example.ejb;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(BeneficioEjbService.class)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:bipdb-concurrency;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class BeneficioEjbServiceConcurrencyTest {

    @Autowired
    private BeneficioEjbService service;

    @PersistenceContext
    private EntityManager em;

    @Autowired
    private PlatformTransactionManager txManager;

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    @DisplayName("Transferências concorrentes não geram lost update graças ao lock pessimista")
    void transferenciasConcorrentes_mantemConsistencia() throws Exception {
        TransactionTemplate tx = new TransactionTemplate(txManager);

        Long[] ids = tx.execute(status -> {
            Beneficio from = new Beneficio("Origem", "saldo inicial 1000", new BigDecimal("1000.00"));
            Beneficio to = new Beneficio("Destino", "saldo inicial 0", new BigDecimal("0.00"));
            em.persist(from);
            em.persist(to);
            em.flush();
            return new Long[]{from.getId(), to.getId()};
        });

        int threadCount = 10;
        BigDecimal amount = new BigDecimal("100.00");

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger sucessos = new AtomicInteger();
        AtomicInteger falhas = new AtomicInteger();

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    start.await();
                    new TransactionTemplate(txManager).executeWithoutResult(s ->
                            service.transfer(ids[0], ids[1], amount));
                    sucessos.incrementAndGet();
                } catch (Exception e) {
                    falhas.incrementAndGet();
                }
            });
        }

        start.countDown();
        executor.shutdown();
        boolean terminou = executor.awaitTermination(30, TimeUnit.SECONDS);
        assertThat(terminou).as("threads não terminaram em 30s").isTrue();

        tx.executeWithoutResult(s -> {
            Beneficio from = em.find(Beneficio.class, ids[0]);
            Beneficio to = em.find(Beneficio.class, ids[1]);

            assertThat(from.getValor())
                    .as("origem deveria zerar após %d transferências de %s", threadCount, amount)
                    .isEqualByComparingTo("0.00");
            assertThat(to.getValor())
                    .as("destino deveria acumular %dx%s = 1000.00", threadCount, amount)
                    .isEqualByComparingTo("1000.00");
            assertThat(from.getValor().add(to.getValor()))
                    .as("soma total deve ser conservada (sem dinheiro perdido nem criado)")
                    .isEqualByComparingTo("1000.00");
        });

        assertThat(sucessos.get()).as("todas as transferências deveriam ter sido bem-sucedidas").isEqualTo(threadCount);
        assertThat(falhas.get()).as("nenhuma falha esperada").isZero();
    }
}

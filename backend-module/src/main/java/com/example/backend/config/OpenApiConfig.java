package com.example.backend.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "BIP Benefícios API",
                version = "1.0.0",
                description = "API REST para gestão de benefícios e transferências entre eles. " +
                        "Inclui CRUD de benefícios e operação de transferência com controle de concorrência (lock pessimista) executada via camada EJB.",
                contact = @Contact(name = "Felipe", email = "felipejorgetop@gmail.com")
        )
)
public class OpenApiConfig {
}

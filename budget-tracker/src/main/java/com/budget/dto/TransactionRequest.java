package com.budget.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {
    @NotBlank(message = "Description is required")
    private String description;

    private String notes;
    private BigDecimal amount;
    private String type; // INCOME or EXPENSE
    private Long categoryId;
    private String transactionDate; // ISO format
}

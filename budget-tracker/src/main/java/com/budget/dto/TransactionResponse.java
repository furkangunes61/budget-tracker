package com.budget.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String description;
    private String notes;
    private BigDecimal amount;
    private String type;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private String transactionDate;
    private String createdAt;
}

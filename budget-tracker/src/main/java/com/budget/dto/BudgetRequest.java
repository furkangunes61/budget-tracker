package com.budget.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetRequest {
    private BigDecimal amount;
    private Long categoryId;
    private String startDate;
    private String endDate;
    private String period;
    private Integer alertThreshold;
    private String notes;
}

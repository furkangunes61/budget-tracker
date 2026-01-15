package com.budget.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private BigDecimal amount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private BigDecimal usagePercentage;
    private String categoryName;
    private String startDate;
    private String endDate;
    private String period;
    private Integer alertThreshold;
    private boolean exceeded;
    private boolean alertThresholdReached;
    private boolean active;
    private String notes;
}

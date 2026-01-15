package com.budget.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "spent_amount")
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private BudgetPeriod period;

    private String notes;

    @Column(name = "alert_threshold")
    private Integer alertThreshold = 80; // %80'e ulaşınca uyarı

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum BudgetPeriod {
        DAILY,      // Günlük
        WEEKLY,     // Haftalık
        MONTHLY,    // Aylık
        YEARLY,     // Yıllık
        CUSTOM      // Özel
    }

    // Bütçe kullanım yüzdesini hesapla
    public BigDecimal getUsagePercentage() {
        if (amount.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return spentAmount.divide(amount, 2, BigDecimal.ROUND_HALF_UP)
                .multiply(new BigDecimal("100"));
    }

    // Kalan bütçeyi hesapla
    public BigDecimal getRemainingAmount() {
        return amount.subtract(spentAmount);
    }

    // Bütçe aşılmış mı?
    public boolean isExceeded() {
        return spentAmount.compareTo(amount) > 0;
    }

    // Uyarı eşiğine ulaşıldı mı?
    public boolean isAlertThresholdReached() {
        return getUsagePercentage().compareTo(new BigDecimal(alertThreshold)) >= 0;
    }
}
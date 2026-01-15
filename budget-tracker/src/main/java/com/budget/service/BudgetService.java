package com.budget.service;

import com.budget.entity.Budget;
import com.budget.entity.Category;
import com.budget.entity.Transaction;
import com.budget.entity.User;
import com.budget.repository.BudgetRepository;
import com.budget.repository.CategoryRepository;
import com.budget.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public Budget createBudget(Budget budget, User user) {
        Category category = categoryRepository.findById(budget.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Çakışan bütçe kontrolü
        List<Budget> overlapping = budgetRepository.findOverlappingBudgets(
                user, category.getId(), budget.getStartDate(), budget.getEndDate());

        if (!overlapping.isEmpty()) {
            throw new RuntimeException("A budget already exists for this category in the given period");
        }

        budget.setUser(user);
        budget.setCategory(category);
        budget.setCreatedAt(LocalDateTime.now());
        budget.setUpdatedAt(LocalDateTime.now());

        Budget saved = budgetRepository.save(budget);

        // Mevcut harcamaları hesapla
        updateBudgetSpending(user, category, LocalDate.now());

        return saved;
    }

    public Budget getBudgetById(Long id, User user) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to budget");
        }

        return budget;
    }

    public List<Budget> getUserBudgets(User user) {
        return budgetRepository.findByUser(user);
    }

    public List<Budget> getActiveBudgets(User user) {
        return budgetRepository.findByUserAndActive(user, true);
    }

    public List<Budget> getActiveBudgetsForDate(User user, LocalDate date) {
        return budgetRepository.findActiveBudgetsForDate(user, date);
    }

    @Transactional
    public Budget updateBudget(Long id, Budget budgetDetails, User user) {
        Budget budget = getBudgetById(id, user);

        budget.setAmount(budgetDetails.getAmount());
        budget.setStartDate(budgetDetails.getStartDate());
        budget.setEndDate(budgetDetails.getEndDate());
        budget.setAlertThreshold(budgetDetails.getAlertThreshold());
        budget.setNotes(budgetDetails.getNotes());
        budget.setUpdatedAt(LocalDateTime.now());

        Budget updated = budgetRepository.save(budget);
        updateBudgetSpending(user, budget.getCategory(), LocalDate.now());

        return updated;
    }

    @Transactional
    public void deleteBudget(Long id, User user) {
        Budget budget = getBudgetById(id, user);
        budgetRepository.delete(budget);
    }

    @Transactional
    public void updateBudgetSpending(User user, Category category, LocalDate date) {
        List<Budget> budgets = budgetRepository.findActiveBudgetsForDate(user, date);

        for (Budget budget : budgets) {
            if (budget.getCategory().getId().equals(category.getId())) {
                BigDecimal spent = transactionRepository.sumByUserAndTypeAndDateBetween(
                        user,
                        Transaction.TransactionType.EXPENSE,
                        budget.getStartDate(),
                        budget.getEndDate()
                );

                budget.setSpentAmount(spent != null ? spent : BigDecimal.ZERO);
                budget.setUpdatedAt(LocalDateTime.now());
                budgetRepository.save(budget);
            }
        }
    }

    public List<Budget> getExceededBudgets(User user) {
        return getActiveBudgets(user).stream()
                .filter(Budget::isExceeded)
                .toList();
    }

    public List<Budget> getBudgetsNearLimit(User user) {
        return getActiveBudgets(user).stream()
                .filter(Budget::isAlertThresholdReached)
                .toList();
    }
}
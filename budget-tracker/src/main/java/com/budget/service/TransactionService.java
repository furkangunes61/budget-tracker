package com.budget.service;

import com.budget.entity.Category;
import com.budget.entity.Transaction;
import com.budget.entity.User;
import com.budget.repository.CategoryRepository;
import com.budget.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetService budgetService;

    @Transactional
    public Transaction createTransaction(Transaction transaction, User user) {
        Category category = categoryRepository.findById(transaction.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setUpdatedAt(LocalDateTime.now());

        Transaction saved = transactionRepository.save(transaction);

        // Bütçe harcamasını güncelle (sadece gider işlemlerinde)
        if (transaction.getType() == Transaction.TransactionType.EXPENSE) {
            budgetService.updateBudgetSpending(user, category, transaction.getTransactionDate());
        }

        return saved;
    }

    public Transaction getTransactionById(Long id, User user) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to transaction");
        }

        return transaction;
    }

    public Page<Transaction> getUserTransactions(User user, Pageable pageable) {
        return transactionRepository.findByUser(user, pageable);
    }

    public Page<Transaction> getUserTransactionsByType(User user, Transaction.TransactionType type, Pageable pageable) {
        return transactionRepository.findByUserAndType(user, type, pageable);
    }

    public List<Transaction> getUserTransactionsInPeriod(User user, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findUserTransactionsInPeriod(user, startDate, endDate);
    }

    @Transactional
    public Transaction updateTransaction(Long id, Transaction transactionDetails, User user) {
        Transaction transaction = getTransactionById(id, user);

        Category category = categoryRepository.findById(transactionDetails.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        transaction.setDescription(transactionDetails.getDescription());
        transaction.setNotes(transactionDetails.getNotes());
        transaction.setAmount(transactionDetails.getAmount());
        transaction.setType(transactionDetails.getType());
        transaction.setCategory(category);
        transaction.setTransactionDate(transactionDetails.getTransactionDate());
        transaction.setUpdatedAt(LocalDateTime.now());

        Transaction updated = transactionRepository.save(transaction);

        // Bütçe harcamasını güncelle
        if (transaction.getType() == Transaction.TransactionType.EXPENSE) {
            budgetService.updateBudgetSpending(user, category, transaction.getTransactionDate());
        }

        return updated;
    }

    @Transactional
    public void deleteTransaction(Long id, User user) {
        Transaction transaction = getTransactionById(id, user);
        Category category = transaction.getCategory();
        LocalDate transactionDate = transaction.getTransactionDate();
        Transaction.TransactionType type = transaction.getType();

        transactionRepository.delete(transaction);

        // Bütçe harcamasını güncelle
        if (type == Transaction.TransactionType.EXPENSE) {
            budgetService.updateBudgetSpending(user, category, transactionDate);
        }
    }

    // Finansal özet hesapla
    public BigDecimal getTotalIncome(User user, LocalDate startDate, LocalDate endDate) {
        BigDecimal total = transactionRepository.sumByUserAndTypeAndDateBetween(
                user, Transaction.TransactionType.INCOME, startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getTotalExpense(User user, LocalDate startDate, LocalDate endDate) {
        BigDecimal total = transactionRepository.sumByUserAndTypeAndDateBetween(
                user, Transaction.TransactionType.EXPENSE, startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getBalance(User user, LocalDate startDate, LocalDate endDate) {
        return getTotalIncome(user, startDate, endDate)
                .subtract(getTotalExpense(user, startDate, endDate));
    }
}

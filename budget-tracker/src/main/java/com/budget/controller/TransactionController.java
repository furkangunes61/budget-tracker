package com.budget.controller;

import com.budget.dto.ApiResponse;
import com.budget.dto.FinancialSummary;
import com.budget.dto.TransactionRequest;
import com.budget.dto.TransactionResponse;
import com.budget.entity.Category;
import com.budget.entity.Transaction;
import com.budget.entity.User;
import com.budget.service.TransactionService;
import com.budget.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @RequestBody TransactionRequest request,
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());

            Transaction transaction = new Transaction();
            transaction.setDescription(request.getDescription());
            transaction.setNotes(request.getNotes());
            transaction.setAmount(request.getAmount());
            transaction.setType(Transaction.TransactionType.valueOf(request.getType()));
            transaction.setTransactionDate(LocalDate.parse(request.getTransactionDate()));

            Category category = new Category();
            category.setId(request.getCategoryId());
            transaction.setCategory(category);

            Transaction created = transactionService.createTransaction(transaction, user);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Transaction created successfully", mapToResponse(created)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getUserTransactions(
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "transactionDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());

            Sort sort = sortDir.equalsIgnoreCase("asc")
                    ? Sort.by(sortBy).ascending()
                    : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);

            Page<Transaction> transactions;
            if (type != null && !type.isEmpty()) {
                Transaction.TransactionType transactionType = Transaction.TransactionType.valueOf(type.toUpperCase());
                transactions = transactionService.getUserTransactionsByType(user, transactionType, pageable);
            } else {
                transactions = transactionService.getUserTransactions(user, pageable);
            }

            Page<TransactionResponse> response = transactions.map(this::mapToResponse);

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());
            Transaction transaction = transactionService.getTransactionById(id, user);

            return ResponseEntity.ok(ApiResponse.success(mapToResponse(transaction)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @PathVariable Long id,
            @RequestBody TransactionRequest request,
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());

            Transaction transaction = new Transaction();
            transaction.setDescription(request.getDescription());
            transaction.setNotes(request.getNotes());
            transaction.setAmount(request.getAmount());
            transaction.setType(Transaction.TransactionType.valueOf(request.getType()));
            transaction.setTransactionDate(LocalDate.parse(request.getTransactionDate()));

            Category category = new Category();
            category.setId(request.getCategoryId());
            transaction.setCategory(category);

            Transaction updated = transactionService.updateTransaction(id, transaction, user);

            return ResponseEntity.ok(ApiResponse.success("Transaction updated", mapToResponse(updated)));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());
            transactionService.deleteTransaction(id, user);

            return ResponseEntity.ok(ApiResponse.success("Transaction deleted", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Object>> getFinancialSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());

            LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().withDayOfMonth(1);
            LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

            FinancialSummary summary = new FinancialSummary(
                    transactionService.getTotalIncome(user, start, end),
                    transactionService.getTotalExpense(user, start, end),
                    transactionService.getBalance(user, start, end),
                    "CUSTOM",
                    start,
                    end);

            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getDescription(),
                transaction.getNotes(),
                transaction.getAmount(),
                transaction.getType().name(),
                transaction.getCategory().getName(),
                transaction.getCategory().getIcon(),
                transaction.getCategory().getColor(),
                transaction.getTransactionDate().toString(),
                transaction.getCreatedAt().toString());
    }
}

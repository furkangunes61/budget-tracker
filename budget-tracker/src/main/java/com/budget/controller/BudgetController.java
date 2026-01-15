package com.budget.controller;

import com.budget.dto.ApiResponse;
import com.budget.dto.BudgetRequest;
import com.budget.dto.BudgetResponse;
import com.budget.entity.Budget;
import com.budget.entity.Category;
import com.budget.entity.User;
import com.budget.service.BudgetService;
import com.budget.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService budgetService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @RequestBody BudgetRequest request,
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());

            Budget budget = new Budget();
            budget.setAmount(request.getAmount());
            budget.setStartDate(LocalDate.parse(request.getStartDate()));
            budget.setEndDate(LocalDate.parse(request.getEndDate()));
            budget.setPeriod(Budget.BudgetPeriod.valueOf(request.getPeriod()));
            budget.setAlertThreshold(request.getAlertThreshold());
            budget.setNotes(request.getNotes());

            Category category = new Category();
            category.setId(request.getCategoryId());
            budget.setCategory(category);

            Budget created = budgetService.createBudget(budget, user);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Budget created successfully", mapToResponse(created)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getUserBudgets(
            @RequestParam(required = false) Boolean active,
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());

            List<Budget> budgets;
            if (active != null && active) {
                budgets = budgetService.getActiveBudgets(user);
            } else {
                budgets = budgetService.getUserBudgets(user);
            }

            List<BudgetResponse> response = budgets.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> getBudget(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());
            Budget budget = budgetService.getBudgetById(id, user);

            return ResponseEntity.ok(ApiResponse.success(mapToResponse(budget)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @PathVariable Long id,
            @RequestBody BudgetRequest request,
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());

            Budget budget = new Budget();
            budget.setAmount(request.getAmount());
            budget.setStartDate(LocalDate.parse(request.getStartDate()));
            budget.setEndDate(LocalDate.parse(request.getEndDate()));
            budget.setAlertThreshold(request.getAlertThreshold());
            budget.setNotes(request.getNotes());

            Budget updated = budgetService.updateBudget(id, budget, user);

            return ResponseEntity.ok(ApiResponse.success("Budget updated", mapToResponse(updated)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBudget(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());
            budgetService.deleteBudget(id, user);

            return ResponseEntity.ok(ApiResponse.success("Budget deleted", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgetAlerts(
            Authentication authentication) {
        try {
            User user = userService.getUserByUsername(authentication.getName());
            List<Budget> nearLimit = budgetService.getBudgetsNearLimit(user);
            List<Budget> exceeded = budgetService.getExceededBudgets(user);

            // İki listeyi yeni bir ArrayList'te birleştir (immutable liste sorunu için)
            List<Budget> allAlerts = new java.util.ArrayList<>(nearLimit);
            allAlerts.addAll(exceeded);

            List<BudgetResponse> response = allAlerts.stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    private BudgetResponse mapToResponse(Budget budget) {
        return new BudgetResponse(
                budget.getId(),
                budget.getAmount(),
                budget.getSpentAmount(),
                budget.getRemainingAmount(),
                budget.getUsagePercentage(),
                budget.getCategory().getName(),
                budget.getStartDate().toString(),
                budget.getEndDate().toString(),
                budget.getPeriod().name(),
                budget.getAlertThreshold(),
                budget.isExceeded(),
                budget.isAlertThresholdReached(),
                budget.isActive(),
                budget.getNotes());
    }
}
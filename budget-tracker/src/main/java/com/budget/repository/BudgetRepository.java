package com.budget.repository;

import com.budget.entity.Budget;
import com.budget.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

        List<Budget> findByUser(User user);

        @Query("SELECT b FROM Budget b WHERE b.user = :user AND b.active = :active")
        List<Budget> findByUserAndActive(@Param("user") User user, @Param("active") boolean active);

        @Query("SELECT b FROM Budget b WHERE b.user = :user " +
                        "AND b.startDate <= :date AND b.endDate >= :date AND b.active = true")
        List<Budget> findActiveBudgetsForDate(
                        @Param("user") User user,
                        @Param("date") LocalDate date);

        @Query("SELECT b FROM Budget b WHERE b.user = :user " +
                        "AND b.category.id = :categoryId " +
                        "AND b.startDate <= :endDate AND b.endDate >= :startDate")
        List<Budget> findOverlappingBudgets(
                        @Param("user") User user,
                        @Param("categoryId") Long categoryId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);
}
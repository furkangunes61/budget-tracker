package com.budget.config;

import com.budget.entity.Category;
import com.budget.entity.User;
import com.budget.repository.CategoryRepository;
import com.budget.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            loadUsers();
        }

        if (categoryRepository.count() == 0) {
            loadCategories();
        }
    }

    private void loadUsers() {
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@budget.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("Admin User");
        admin.setRole(User.Role.ADMIN);
        admin.setEnabled(true);
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());

        User user = new User();
        user.setUsername("user");
        user.setEmail("user@budget.com");
        user.setPassword(passwordEncoder.encode("user123"));
        user.setFullName("Test User");
        user.setRole(User.Role.USER);
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.saveAll(Arrays.asList(admin, user));
        System.out.println("✓ Default users created (admin/admin123, user/user123)");
    }

    private void loadCategories() {
        // Gelir Kategorileri
        List<Category> incomeCategories = Arrays.asList(
                createCategory("Maaş", "Aylık maaş geliri", Category.CategoryType.INCOME, "💰", "#4CAF50"),
                createCategory("Freelance", "Serbest çalışma geliri", Category.CategoryType.INCOME, "💼", "#8BC34A"),
                createCategory("Yatırım", "Yatırım gelirleri", Category.CategoryType.INCOME, "📈", "#CDDC39"),
                createCategory("Kira", "Kira geliri", Category.CategoryType.INCOME, "🏠", "#FFEB3B"),
                createCategory("Hediye", "Hediye olarak alınan para", Category.CategoryType.INCOME, "🎁", "#FFC107")
        );

        // Gider Kategorileri
        List<Category> expenseCategories = Arrays.asList(
                createCategory("Yiyecek", "Market ve gıda alışverişi", Category.CategoryType.EXPENSE, "🛒", "#FF5722"),
                createCategory("Ulaşım", "Toplu taşıma, yakıt vb.", Category.CategoryType.EXPENSE, "🚗", "#FF9800"),
                createCategory("Konut", "Kira, elektrik, su, doğalgaz", Category.CategoryType.EXPENSE, "🏡", "#F44336"),
                createCategory("Sağlık", "İlaç, doktor, hastane", Category.CategoryType.EXPENSE, "⚕️", "#E91E63"),
                createCategory("Eğitim", "Okul, kurs, kitap", Category.CategoryType.EXPENSE, "📚", "#9C27B0"),
                createCategory("Eğlence", "Sinema, konser, hobiler", Category.CategoryType.EXPENSE, "🎭", "#673AB7"),
                createCategory("Giyim", "Kıyafet ve ayakkabı", Category.CategoryType.EXPENSE, "👔", "#3F51B5"),
                createCategory("Teknoloji", "Telefon, bilgisayar, elektronik", Category.CategoryType.EXPENSE, "💻", "#2196F3"),
                createCategory("Spor", "Spor salonu, ekipman", Category.CategoryType.EXPENSE, "⚽", "#03A9F4"),
                createCategory("Restoran", "Dışarıda yemek", Category.CategoryType.EXPENSE, "🍽️", "#00BCD4"),
                createCategory("Alışveriş", "Genel alışveriş", Category.CategoryType.EXPENSE, "🛍️", "#009688"),
                createCategory("Borç Ödeme", "Kredi kartı, kredi ödemeleri", Category.CategoryType.EXPENSE, "💳", "#795548"),
                createCategory("Sigorta", "Sağlık, araç sigortası", Category.CategoryType.EXPENSE, "🛡️", "#607D8B"),
                createCategory("Diğer", "Diğer giderler", Category.CategoryType.EXPENSE, "📦", "#9E9E9E")
        );

        categoryRepository.saveAll(incomeCategories);
        categoryRepository.saveAll(expenseCategories);

        System.out.println("✓ " + incomeCategories.size() + " income categories created");
        System.out.println("✓ " + expenseCategories.size() + " expense categories created");
    }

    private Category createCategory(String name, String description,
                                    Category.CategoryType type, String icon, String color) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setType(type);
        category.setIcon(icon);
        category.setColor(color);
        category.setCreatedAt(LocalDateTime.now());
        return category;
    }
}
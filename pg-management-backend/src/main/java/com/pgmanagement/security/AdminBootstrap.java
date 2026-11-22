package com.pgmanagement.security;

import com.pgmanagement.excel.ExcelStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class AdminBootstrap implements ApplicationRunner {
    private final ExcelStorageService excel;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String password;

    public AdminBootstrap(
            ExcelStorageService excel,
            PasswordEncoder passwordEncoder,
            @Value("${pg.admin.username}") String username,
            @Value("${pg.admin.password}") String password) {
        this.excel = excel;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!excel.readAll("users.xlsx").isEmpty()) return;

        if (password == null || password.length() < 12) {
            throw new IllegalStateException("PG_ADMIN_PASSWORD must contain at least 12 characters.");
        }

        Map<String, String> admin = new LinkedHashMap<>();
        admin.put("userId", "USR-" + UUID.randomUUID());
        admin.put("username", username);
        admin.put("passwordHash", passwordEncoder.encode(password));
        admin.put("role", "ADMIN");
        admin.put("enabled", "true");
        admin.put("createdAt", LocalDateTime.now().toString());
        excel.append("users.xlsx", admin);

        System.out.println("Initial PG admin account created in SQLite for username: " + username);
        System.out.println("Change the initial password after first login; protect the SQLite database file.");
    }
}

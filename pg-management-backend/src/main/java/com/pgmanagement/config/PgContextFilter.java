package com.pgmanagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Locale;
import java.util.Set;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PgContextFilter extends OncePerRequestFilter {
    private static final Set<String> ALLOWED = Set.of("AKKA-PG", "SUBASH-PG");
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String requested = request.getHeader("X-PG-CODE");
        String code = requested == null || requested.isBlank() ? "AKKA-PG" : requested.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED.contains(code)) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Unknown PG workspace");
            return;
        }
        PgContext.set(code);
        try { chain.doFilter(request, response); }
        finally { PgContext.clear(); }
    }
}

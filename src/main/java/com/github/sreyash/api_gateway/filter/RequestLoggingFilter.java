package com.github.sreyash.api_gateway.filter;

import com.github.sreyash.api_gateway.model.AuditLog;
import com.github.sreyash.api_gateway.repository.AuditLogRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class RequestLoggingFilter extends OncePerRequestFilter {

    private final AuditLogRepository auditLogRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        filterChain.doFilter(request, response);

        long duration = System.currentTimeMillis() - startTime;

        String username = "anonymous";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            username = auth.getName();
        }

        String path = request.getRequestURI();

        log.info("[{}] {} {} - {} ({}ms) user={}",
                request.getRemoteAddr(),
                request.getMethod(),
                path,
                response.getStatus(),
                duration,
                username);

        // Skip logging for static assets and actuator to avoid noise
        if (!path.startsWith("/actuator") && !path.contains(".")) {
            try {
                AuditLog auditLog = AuditLog.builder()
                        .method(request.getMethod())
                        .path(path)
                        .status(response.getStatus())
                        .latencyMs(duration)
                        .ip(request.getRemoteAddr())
                        .username(username)
                        .timestamp(Instant.now())
                        .build();
                auditLogRepository.save(auditLog);
            } catch (Exception e) {
                log.warn("Failed to save audit log: {}", e.getMessage());
            }
        }
    }
}
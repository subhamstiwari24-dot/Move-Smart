package com.movesmart.movesmart_backend.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write(
                        "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required to access this resource\"}"
                    );
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json");
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write(
                        "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Access denied: insufficient permissions for this operational resource\"}"
                    );
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Public auth and health endpoints
                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/auth/forgot-password",
                    "/api/auth/reset-password",
                    "/api/health",
                    "/uploads/**"
                ).permitAll()

                // Protected Admin-only user management
                .requestMatchers("/api/auth/users/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/auth/me", "/api/auth/profile", "/api/auth/change-password").authenticated()
                .requestMatchers("/api/notifications/**").authenticated()

                // Public read access for community map, incident tracking by ID, and statistics
                .requestMatchers(HttpMethod.GET, "/api/incidents").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/incidents/stats").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/incidents/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/incidents/track/**").permitAll()

                // Authenticated reporting, evidence upload & own report tracking (CITIZEN, OPERATIONS, ADMIN)
                .requestMatchers(HttpMethod.GET, "/api/incidents/my-reports").hasAnyAuthority("ROLE_CITIZEN", "ROLE_OPERATIONS", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/incidents").hasAnyAuthority("ROLE_CITIZEN", "ROLE_OPERATIONS", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/incidents/upload").hasAnyAuthority("ROLE_CITIZEN", "ROLE_OPERATIONS", "ROLE_ADMIN")

                // Protected operational administrative endpoints (OPERATIONS & ADMIN)
                .requestMatchers(HttpMethod.PATCH, "/api/incidents/*/status").hasAnyAuthority("ROLE_OPERATIONS", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/incidents/*").hasAnyAuthority("ROLE_OPERATIONS", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/incidents/*").hasAnyAuthority("ROLE_OPERATIONS", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/incidents/reset").hasAnyAuthority("ROLE_OPERATIONS", "ROLE_ADMIN")
                .requestMatchers("/api/activities/**").hasAnyAuthority("ROLE_OPERATIONS", "ROLE_ADMIN")

                // H2 web console (development only)
                .requestMatchers("/h2-console/**").permitAll()

                // Any other endpoint requires authentication
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

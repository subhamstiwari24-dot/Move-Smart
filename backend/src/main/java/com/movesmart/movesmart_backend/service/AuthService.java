package com.movesmart.movesmart_backend.service;

import com.movesmart.movesmart_backend.dto.*;
import com.movesmart.movesmart_backend.model.Role;
import com.movesmart.movesmart_backend.model.User;
import com.movesmart.movesmart_backend.repository.UserRepository;
import com.movesmart.movesmart_backend.security.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse login(LoginRequest req) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(req.getEmail().trim());
        if (userOpt.isEmpty()) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userOpt.get();
        if (!user.isActive()) {
            throw new BadCredentialsException("Your account has been deactivated. Please contact an administrator.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                jwtUtil.getExpirationMs()
        );
    }

    @Transactional
    public AuthResponse registerCitizen(RegisterRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered in MoveSmart");
        }

        String id = "USR-" + System.currentTimeMillis();
        String encodedPassword = passwordEncoder.encode(req.getPassword());

        // Enforce strictly ROLE_CITIZEN. No external user can register as OPERATIONS or ADMIN.
        User user = new User(
                id,
                email,
                encodedPassword,
                req.getFullName().trim(),
                Role.ROLE_CITIZEN,
                req.getPhone(),
                true,
                "SELF_REGISTRATION",
                Instant.now().toString()
        );

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved);

        return new AuthResponse(
                token,
                saved.getId(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getRole().name(),
                jwtUtil.getExpirationMs()
        );
    }

    @Transactional
    public UserResponse createStaffUser(CreateStaffRequest req, User adminActor) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("A user with email " + email + " already exists");
        }

        Role assignedRole = Role.ROLE_OPERATIONS;
        if (req.getRole() != null) {
            String roleUpper = req.getRole().trim().toUpperCase();
            if (roleUpper.equals("ROLE_ADMIN") || roleUpper.equals("ADMIN")) {
                assignedRole = Role.ROLE_ADMIN;
            } else if (roleUpper.equals("ROLE_OPERATIONS") || roleUpper.equals("OPERATIONS")) {
                assignedRole = Role.ROLE_OPERATIONS;
            } else {
                throw new IllegalArgumentException("Staff role must be either ROLE_OPERATIONS or ROLE_ADMIN");
            }
        }

        String id = (assignedRole == Role.ROLE_ADMIN ? "ADM-" : "OPS-") + System.currentTimeMillis();
        String encodedPassword = passwordEncoder.encode(req.getPassword());

        User staff = new User(
                id,
                email,
                encodedPassword,
                req.getFullName().trim(),
                assignedRole,
                req.getPhone(),
                true,
                adminActor.getEmail(),
                Instant.now().toString()
        );

        User saved = userRepository.save(staff);
        return UserResponse.fromEntity(saved);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse setUserStatus(String userId, boolean active, User adminActor) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Prevent admin from deactivating themselves
        if (target.getId().equals(adminActor.getId())) {
            throw new IllegalArgumentException("You cannot deactivate your own account");
        }

        target.setActive(active);
        User saved = userRepository.save(target);
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("No registered account found with email: " + email));

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public UserResponse getCurrentUser(User user) {
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateProfile(User user, UpdateProfileRequest req) {
        User target = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (req.getFullName() != null && !req.getFullName().trim().isEmpty()) {
            target.setFullName(req.getFullName().trim());
        }
        if (req.getPhone() != null) {
            target.setPhone(req.getPhone().trim());
        }

        User saved = userRepository.save(target);
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest req) {
        User target = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), target.getPassword())) {
            throw new BadCredentialsException("Current password does not match");
        }

        if (req.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }

        target.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(target);
    }
}

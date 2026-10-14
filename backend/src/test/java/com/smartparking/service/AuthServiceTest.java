package com.smartparking.service;

import com.smartparking.dto.AuthRequest;
import com.smartparking.dto.AuthResponse;
import com.smartparking.dto.RegisterRequest;
import com.smartparking.model.User;
import com.smartparking.repository.UserRepository;
import com.smartparking.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setName("Test User");
        sampleUser.setEmail("test@smartpark.com");
        sampleUser.setPassword("encodedPassword");
        sampleUser.setPhone("+1234567890");
        sampleUser.setRole(User.Role.USER);
    }

    @Test
    void testLoginSuccess() {
        AuthRequest request = new AuthRequest();
        request.setEmail("Test@SmartPark.com ");
        request.setPassword("password123");

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt-test-token");
        when(userRepository.findByEmailIgnoreCase("test@smartpark.com")).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-test-token", response.getToken());
        assertEquals("test@smartpark.com", response.getEmail());
        assertEquals("USER", response.getRole());
        assertEquals("Test User", response.getName());
    }

    @Test
    void testLoginInvalidCredentials() {
        AuthRequest request = new AuthRequest();
        request.setEmail("test@smartpark.com");
        request.setPassword("wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setName("New User");
        request.setEmail(" New@SmartPark.com ");
        request.setPassword("secret123");
        request.setPhone("+1987654321");

        when(userRepository.existsByEmailIgnoreCase("new@smartpark.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encodedSecret");
        when(jwtUtils.generateTokenFromEmail("new@smartpark.com")).thenReturn("jwt-new-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt-new-token", response.getToken());
        assertEquals("new@smartpark.com", response.getEmail());
        assertEquals("USER", response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testRegisterEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Existing User");
        request.setEmail("test@smartpark.com");
        request.setPassword("password123");

        when(userRepository.existsByEmailIgnoreCase("test@smartpark.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(request));
        assertEquals("Email already in use", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}

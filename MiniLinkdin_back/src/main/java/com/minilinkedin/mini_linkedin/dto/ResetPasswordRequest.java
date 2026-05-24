package com.minilinkedin.mini_linkedin.dto;

public record ResetPasswordRequest(String token, String newPassword) {}

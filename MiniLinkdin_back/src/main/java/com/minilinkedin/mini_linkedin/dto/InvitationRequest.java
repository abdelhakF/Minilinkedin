package com.minilinkedin.mini_linkedin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationRequest {
    private Long receiverId;
    private String receiverEmail;
}
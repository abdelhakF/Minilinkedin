package com.minilinkedin.mini_linkedin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {
    private Long receiverId;    // ID du destinataire
    private String messageBody; // Contenu du message
}

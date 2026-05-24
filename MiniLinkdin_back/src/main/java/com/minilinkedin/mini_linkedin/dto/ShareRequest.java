package com.minilinkedin.mini_linkedin.dto;

import lombok.Data;
import java.util.List;

@Data
public class ShareRequest {
    private String commentShare;       // commentaire optionnel
    private List<Long> destinataireIds; // IDs des utilisateurs concernés
}

// src/main/java/com/minilinkedin/mini_linkedin/model/PublicationPost.java
package com.minilinkedin.mini_linkedin.model;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("PUBLICATION")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PublicationPost extends Post {

    // On s'assure que PostgreSQL accepte les longues chaînes Base64
    @Column(columnDefinition = "TEXT")
    private String mediaUrl;

    private String visibility = "PUBLIC"; // PUBLIC ou CONNECTIONS_ONLY
}
/*
 * Recommendation.java - Version finale propre
 */
package com.minilinkedin.mini_linkedin.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import com.fasterxml.jackson.annotation.JsonIgnore;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Data
@NoArgsConstructor
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "profile_id", nullable = false)
    @JsonIgnore
    private Profile profile;

    @Column(nullable = false, length = 150)
    private String recommenderName;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationStatus status = RecommendationStatus.PENDING;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false, updatable = false)
    private Date createdOn;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "notification_id")
    private Notification notification;
    
    @Column(nullable = false)
    private String recommenderEmail;

    
    @PrePersist
    protected void onCreate() {
        createdOn = new Date();
    }
}
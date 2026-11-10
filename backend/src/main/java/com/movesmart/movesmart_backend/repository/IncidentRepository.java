package com.movesmart.movesmart_backend.repository;

import com.movesmart.movesmart_backend.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, String> {

    List<Incident> findAllByOrderByCreatedAtDesc();

    List<Incident> findByReporterUserIdOrReporterEmailIgnoreCaseOrderByCreatedAtDesc(String reporterUserId, String reporterEmail);

    java.util.Optional<Incident> findByTrackingIdIgnoreCase(String trackingId);

    java.util.Optional<Incident> findByIdIgnoreCaseOrTrackingIdIgnoreCase(String id, String trackingId);

    @Query("SELECT i.id FROM Incident i WHERE i.id LIKE 'MS-%'")
    List<String> findAllIncidentIds();
}

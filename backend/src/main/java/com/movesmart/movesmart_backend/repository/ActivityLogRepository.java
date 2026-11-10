package com.movesmart.movesmart_backend.repository;

import com.movesmart.movesmart_backend.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, String> {

    List<ActivityLog> findTop100ByOrderByTimestampDesc();
}

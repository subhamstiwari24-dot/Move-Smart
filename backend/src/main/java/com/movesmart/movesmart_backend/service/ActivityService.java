package com.movesmart.movesmart_backend.service;

import com.movesmart.movesmart_backend.model.ActivityLog;
import com.movesmart.movesmart_backend.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ActivityService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
    }

    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findTop100ByOrderByTimestampDesc();
    }

    public ActivityLog log(String type, String incidentId, String title, String description,
                          String actor, String prevVal, String newVal) {
        String id = "ACT-" + System.currentTimeMillis();
        String timestamp = Instant.now().toString();
        ActivityLog log = new ActivityLog(id, type, incidentId, title, description, timestamp, actor, prevVal, newVal);
        return activityLogRepository.save(log);
    }

    public void clearAll() {
        activityLogRepository.deleteAll();
    }
}

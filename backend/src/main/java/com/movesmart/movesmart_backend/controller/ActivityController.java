package com.movesmart.movesmart_backend.controller;

import com.movesmart.movesmart_backend.model.ActivityLog;
import com.movesmart.movesmart_backend.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getActivities() {
        return ResponseEntity.ok(activityService.getRecentActivities());
    }
}

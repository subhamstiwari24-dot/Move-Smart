package com.movesmart.movesmart_backend.service;

import com.movesmart.movesmart_backend.dto.*;
import com.movesmart.movesmart_backend.model.Incident;
import com.movesmart.movesmart_backend.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final ActivityService activityService;
    private final NotificationService notificationService;

    public IncidentService(IncidentRepository incidentRepository, ActivityService activityService, NotificationService notificationService) {
        this.incidentRepository = incidentRepository;
        this.activityService = activityService;
        this.notificationService = notificationService;
    }

    public List<IncidentDto> getAllIncidents(String category, String priority, String status, String search, String sortBy) {
        List<Incident> list = incidentRepository.findAll();

        return list.stream()
            .filter(inc -> {
                if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all")) {
                    if (!inc.getCategory().equalsIgnoreCase(category)) return false;
                }
                if (priority != null && !priority.isBlank() && !priority.equalsIgnoreCase("all")) {
                    if (!inc.getPriority().equalsIgnoreCase(priority)) return false;
                }
                if (status != null && !status.isBlank() && !status.equalsIgnoreCase("all")) {
                    if (!inc.getStatus().equalsIgnoreCase(status)) return false;
                }
                if (search != null && !search.isBlank()) {
                    String q = search.trim().toLowerCase();
                    boolean match = (inc.getId() != null && inc.getId().toLowerCase().contains(q)) ||
                                    (inc.getTitle() != null && inc.getTitle().toLowerCase().contains(q)) ||
                                    (inc.getLocation() != null && inc.getLocation().toLowerCase().contains(q)) ||
                                    (inc.getDescription() != null && inc.getDescription().toLowerCase().contains(q));
                    if (!match) return false;
                }
                return true;
            })
            .sorted((a, b) -> {
                if ("oldest".equalsIgnoreCase(sortBy)) {
                    return a.getCreatedAt().compareTo(b.getCreatedAt());
                } else if ("priority".equalsIgnoreCase(sortBy)) {
                    Map<String, Integer> weight = Map.of("Critical", 4, "High", 3, "Medium", 2, "Low", 1);
                    int wA = weight.getOrDefault(a.getPriority(), 0);
                    int wB = weight.getOrDefault(b.getPriority(), 0);
                    return Integer.compare(wB, wA);
                } else if ("category".equalsIgnoreCase(sortBy)) {
                    return a.getCategory().compareToIgnoreCase(b.getCategory());
                } else {
                    // Default newest
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                }
            })
            .map(IncidentDto::fromEntity)
            .collect(Collectors.toList());
    }

    public Optional<IncidentDto> getIncidentById(String id) {
        return incidentRepository.findById(id).map(IncidentDto::fromEntity);
    }

    @Transactional
    public synchronized IncidentDto createIncident(CreateIncidentRequest req) {
        return createIncident(req, null);
    }

    @Transactional
    public synchronized IncidentDto createIncident(CreateIncidentRequest req, com.movesmart.movesmart_backend.model.User currentUser) {
        int currentYear = Year.now().getValue();
        List<String> ids = incidentRepository.findAllIncidentIds();

        Pattern pattern = Pattern.compile("^MS-\\d{4}-(\\d+)$");
        int maxNum = 100;
        Set<String> idSet = new HashSet<>();

        for (String id : ids) {
            idSet.add(id.toLowerCase());
            Matcher m = pattern.matcher(id);
            if (m.matches()) {
                try {
                    int num = Integer.parseInt(m.group(1));
                    if (num > maxNum) maxNum = num;
                } catch (NumberFormatException ignored) {}
            }
        }

        int nextNum = maxNum + 1;
        String newId = String.format("MS-%d-%d", currentYear, nextNum);
        while (idSet.contains(newId.toLowerCase())) {
            nextNum++;
            newId = String.format("MS-%d-%d", currentYear, nextNum);
        }

        String now = Instant.now().toString();
        String trackingId = "MS-TRK-" + (10000 + new java.util.Random().nextInt(90000));

        Incident entity = new Incident();
        entity.setId(newId);
        entity.setTrackingId(trackingId);
        entity.setTitle(req.getTitle());
        entity.setCategory(req.getCategory());
        entity.setDescription(req.getDescription());
        entity.setLocation(req.getLocation());
        entity.setLatitude(req.getLatitude());
        entity.setLongitude(req.getLongitude());
        entity.setPhotoUrl(req.getPhotoUrl());
        entity.setPublicUpdate("Complaint registered in operations queue and awaiting verification.");

        // Validate priority
        String priority = req.getPriority() != null ? req.getPriority() : "Medium";
        entity.setPriority(priority);

        // Security rule: Citizens ALWAYS create incidents in "Submitted" status
        // Operational units & admin notes cannot be assigned by citizens
        if (currentUser == null || currentUser.getRole() == com.movesmart.movesmart_backend.model.Role.ROLE_CITIZEN) {
            entity.setStatus("Submitted");
            entity.setAssignedUnit(null);
            entity.setAdminNotes(null);
        } else {
            // Operations / Admin role can specify status and assigned units
            entity.setStatus(req.getStatus() != null ? req.getStatus() : "Submitted");
            entity.setAssignedUnit(req.getAssignedUnit());
            entity.setAdminNotes(req.getAdminNotes());
        }

        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        entity.setEstimatedImpact(req.getEstimatedImpact());

        // User linkage and reporter info
        if (currentUser != null) {
            entity.setReporterUserId(currentUser.getId());
            boolean isAnon = req.getReporter() != null && Boolean.TRUE.equals(req.getReporter().getIsAnonymous());
            entity.setIsAnonymous(isAnon);
            entity.setReporterEmail(currentUser.getEmail());
            entity.setReporterName(isAnon ? "Anonymous Citizen" : currentUser.getFullName());
            entity.setReporterPhone(currentUser.getPhone() != null ? currentUser.getPhone() : (req.getReporter() != null ? req.getReporter().getPhone() : null));
        } else if (req.getReporter() != null) {
            entity.setReporterName(req.getReporter().getName());
            entity.setReporterPhone(req.getReporter().getPhone());
            entity.setReporterEmail(req.getReporter().getEmail());
            entity.setIsAnonymous(req.getReporter().getIsAnonymous());
        } else {
            entity.setReporterName("Anonymous Citizen");
            entity.setIsAnonymous(true);
        }

        Incident saved = incidentRepository.save(entity);

        String reporterLabel = entity.getReporterName() != null ? "Citizen (" + entity.getReporterName() + ")" : "Anonymous Citizen";
        activityService.log(
            "INCIDENT_SUBMITTED",
            saved.getId(),
            "New Incident Reported: " + saved.getTitle(),
            "Category: " + saved.getCategory() + " | Priority: " + saved.getPriority() + " | Location: " + saved.getLocation(),
            reporterLabel,
            null,
            saved.getStatus()
        );

        if (saved.getReporterUserId() != null) {
            notificationService.createNotification(
                saved.getReporterUserId(),
                saved.getId(),
                "Complaint Registered (" + saved.getId() + ")",
                "Your hazard report '" + saved.getTitle() + "' was successfully logged with tracking ID " + saved.getTrackingId() + ".",
                "SUBMITTED"
            );
        }

        return IncidentDto.fromEntity(saved);
    }

    public List<IncidentDto> getMyReports(com.movesmart.movesmart_backend.model.User currentUser) {
        if (currentUser == null) return Collections.emptyList();
        return incidentRepository
            .findByReporterUserIdOrReporterEmailIgnoreCaseOrderByCreatedAtDesc(currentUser.getId(), currentUser.getEmail())
            .stream()
            .map(IncidentDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public Optional<IncidentDto> updateIncident(String id, UpdateIncidentRequest req) {
        Optional<Incident> opt = incidentRepository.findById(id);
        if (opt.isEmpty()) return Optional.empty();

        Incident existing = opt.get();
        if (req.getTitle() != null) existing.setTitle(req.getTitle());
        if (req.getCategory() != null) existing.setCategory(req.getCategory());
        if (req.getDescription() != null) existing.setDescription(req.getDescription());
        if (req.getLocation() != null) existing.setLocation(req.getLocation());
        if (req.getLatitude() != null) existing.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) existing.setLongitude(req.getLongitude());
        if (req.getPriority() != null) existing.setPriority(req.getPriority());
        if (req.getStatus() != null) existing.setStatus(req.getStatus());
        if (req.getEstimatedImpact() != null) existing.setEstimatedImpact(req.getEstimatedImpact());
        if (req.getAssignedUnit() != null) existing.setAssignedUnit(req.getAssignedUnit());
        if (req.getAdminNotes() != null) existing.setAdminNotes(req.getAdminNotes());

        if (req.getReporter() != null) {
            if (req.getReporter().getName() != null) existing.setReporterName(req.getReporter().getName());
            if (req.getReporter().getPhone() != null) existing.setReporterPhone(req.getReporter().getPhone());
            if (req.getReporter().getEmail() != null) existing.setReporterEmail(req.getReporter().getEmail());
            if (req.getReporter().getIsAnonymous() != null) existing.setIsAnonymous(req.getReporter().getIsAnonymous());
        }

        existing.setUpdatedAt(Instant.now().toString());
        Incident saved = incidentRepository.save(existing);

        activityService.log(
            "INCIDENT_EDITED",
            saved.getId(),
            "Incident Updated: " + saved.getTitle(),
            "Administrative update applied to incident details",
            "Admin (Operations)",
            null,
            null
        );

        return Optional.of(IncidentDto.fromEntity(saved));
    }

    public Optional<IncidentDto> getIncidentByTrackingId(String trackingIdOrId) {
        if (trackingIdOrId == null || trackingIdOrId.isBlank()) return Optional.empty();
        String q = trackingIdOrId.trim();
        return incidentRepository.findByIdIgnoreCaseOrTrackingIdIgnoreCase(q, q).map(IncidentDto::fromEntity);
    }

    @Transactional
    public Optional<IncidentDto> updateIncidentStatus(String id, UpdateStatusRequest req) {
        return updateIncidentStatus(id, req, null);
    }

    @Transactional
    public Optional<IncidentDto> updateIncidentStatus(String id, UpdateStatusRequest req, com.movesmart.movesmart_backend.model.User currentUser) {
        Optional<Incident> opt = incidentRepository.findById(id);
        if (opt.isEmpty()) return Optional.empty();

        Incident existing = opt.get();
        String prevStatus = existing.getStatus();
        String newStatus = req.getStatus();
        existing.setStatus(newStatus);
        existing.setUpdatedAt(Instant.now().toString());

        if (req.getAdminNote() != null && !req.getAdminNote().isBlank()) {
            String updatedNotes = existing.getAdminNotes() != null && !existing.getAdminNotes().isBlank()
                ? existing.getAdminNotes() + " | " + req.getAdminNote()
                : req.getAdminNote();
            existing.setAdminNotes(updatedNotes);
        }

        if (req.getPublicUpdate() != null && !req.getPublicUpdate().isBlank()) {
            existing.setPublicUpdate(req.getPublicUpdate().trim());
        }

        if (req.getAssignedUnit() != null && !req.getAssignedUnit().isBlank()) {
            existing.setAssignedUnit(req.getAssignedUnit().trim());
        }

        if (req.getPriority() != null && !req.getPriority().isBlank()) {
            existing.setPriority(req.getPriority().trim());
        }

        Incident saved = incidentRepository.save(existing);

        String actor = currentUser != null
            ? currentUser.getFullName() + " (" + currentUser.getRole().name().replace("ROLE_", "") + ")"
            : "Operations Officer";

        boolean isResolved = "Resolved".equalsIgnoreCase(newStatus);
        activityService.log(
            isResolved ? "INCIDENT_RESOLVED" : "STATUS_UPDATED",
            saved.getId(),
            "Status changed to " + newStatus + ": " + saved.getTitle(),
            req.getPublicUpdate() != null ? req.getPublicUpdate() : (req.getAdminNote() != null ? req.getAdminNote() : "Status updated from " + prevStatus + " to " + newStatus),
            actor,
            prevStatus,
            newStatus
        );

        if (saved.getReporterUserId() != null) {
            String notifType = "STATUS_UPDATED";
            String notifTitle = "Complaint Status Updated (" + saved.getId() + ")";
            String notifMsg = "Your report status changed to " + newStatus + ".";

            if ("Verified".equalsIgnoreCase(newStatus)) {
                notifType = "VERIFIED";
                notifTitle = "Complaint Verified (" + saved.getId() + ")";
                notifMsg = "Your hazard report has been verified by Mumbai Traffic Operations.";
            } else if ("Resolved".equalsIgnoreCase(newStatus)) {
                notifType = "RESOLVED";
                notifTitle = "Complaint Resolved (" + saved.getId() + ")";
                notifMsg = "Municipal units have cleared and resolved the hazard.";
            } else if ("Rejected".equalsIgnoreCase(newStatus)) {
                notifType = "REJECTED";
                notifTitle = "Complaint Marked as Rejected (" + saved.getId() + ")";
                notifMsg = req.getPublicUpdate() != null ? req.getPublicUpdate() : "The complaint could not be verified or was noted as duplicate.";
            } else if ("In Progress".equalsIgnoreCase(newStatus)) {
                notifType = "STATUS_UPDATED";
                notifTitle = "Response Crews Dispatched (" + saved.getId() + ")";
                notifMsg = "Response units are actively addressing the traffic hazard.";
            }

            if (req.getPublicUpdate() != null && !req.getPublicUpdate().isBlank()) {
                notifMsg = notifMsg + " Advisory: " + req.getPublicUpdate().trim();
            }

            notificationService.createNotification(
                saved.getReporterUserId(),
                saved.getId(),
                notifTitle,
                notifMsg,
                notifType
            );
        }

        return Optional.of(IncidentDto.fromEntity(saved));
    }

    @Transactional
    public boolean deleteIncident(String id) {
        Optional<Incident> opt = incidentRepository.findById(id);
        if (opt.isEmpty()) return false;

        Incident existing = opt.get();
        incidentRepository.delete(existing);

        activityService.log(
            "INCIDENT_DELETED",
            id,
            "Incident Deleted: " + existing.getTitle() + " (" + id + ")",
            "Permanently removed from active operations log by admin",
            "Admin (Supervisor)",
            null,
            null
        );

        return true;
    }

    public StatisticsDto getStatistics() {
        List<Incident> incidents = incidentRepository.findAll();
        long total = incidents.size();
        long reported = 0;
        long inProgress = 0;
        long resolved = 0;
        long criticalOrHighOpen = 0;

        for (Incident inc : incidents) {
            String s = inc.getStatus();
            if ("Reported".equalsIgnoreCase(s)) reported++;
            else if ("In Progress".equalsIgnoreCase(s)) inProgress++;
            else if ("Resolved".equalsIgnoreCase(s)) resolved++;

            if (!"Resolved".equalsIgnoreCase(s)) {
                String p = inc.getPriority();
                if ("High".equalsIgnoreCase(p) || "Critical".equalsIgnoreCase(p)) {
                    criticalOrHighOpen++;
                }
            }
        }

        int rate = total > 0 ? (int) Math.round(((double) resolved / total) * 100) : 0;
        return new StatisticsDto(total, reported, inProgress, resolved, criticalOrHighOpen, rate);
    }
}

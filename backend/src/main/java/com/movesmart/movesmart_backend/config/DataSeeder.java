package com.movesmart.movesmart_backend.config;

import com.movesmart.movesmart_backend.model.ActivityLog;
import com.movesmart.movesmart_backend.model.Incident;
import com.movesmart.movesmart_backend.model.Role;
import com.movesmart.movesmart_backend.model.User;
import com.movesmart.movesmart_backend.repository.ActivityLogRepository;
import com.movesmart.movesmart_backend.repository.IncidentRepository;
import com.movesmart.movesmart_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final IncidentRepository incidentRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${movesmart.seeding.enabled:true}")
    private boolean seedingEnabled;

    @Value("${movesmart.initial-admin.email:admin@movesmart.city}")
    private String initialAdminEmail;

    @Value("${movesmart.initial-admin.password:Admin@2026}")
    private String initialAdminPassword;

    public DataSeeder(IncidentRepository incidentRepository,
                      ActivityLogRepository activityLogRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.incidentRepository = incidentRepository;
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedInitialAdminIfMissing();
        if (seedingEnabled) {
            seedDemoUsersIfMissing();
            if (incidentRepository.count() == 0) {
                seedAll();
            }
        }
    }

    public synchronized void seedUsersIfMissing() {
        seedInitialAdminIfMissing();
        seedDemoUsersIfMissing();
    }

    public synchronized void seedInitialAdminIfMissing() {
        if (initialAdminPassword == null || initialAdminPassword.trim().isEmpty()) {
            return;
        }
        if (!userRepository.existsByEmailIgnoreCase(initialAdminEmail)) {
            User adminUser = new User(
                "USR-ADM-01",
                initialAdminEmail,
                passwordEncoder.encode(initialAdminPassword),
                "Chief Operations Administrator",
                Role.ROLE_ADMIN,
                "+91 22 2493 0001",
                Instant.now().toString()
            );
            userRepository.save(adminUser);
        }
    }

    public synchronized void seedDemoUsersIfMissing() {
        if (!userRepository.existsByEmailIgnoreCase("ops.admin@movesmart.city")) {
            User opsUser = new User(
                "USR-OPS-01",
                "ops.admin@movesmart.city",
                passwordEncoder.encode("Operations@2026"),
                "Control Room Commander",
                Role.ROLE_OPERATIONS,
                "+91 22 2493 7755",
                Instant.now().toString()
            );
            userRepository.save(opsUser);
        }

        if (!userRepository.existsByEmailIgnoreCase("citizen.mumbai@movesmart.city")) {
            User citizenUser = new User(
                "USR-CIT-01",
                "citizen.mumbai@movesmart.city",
                passwordEncoder.encode("Citizen@2026"),
                "Aarav Mehta",
                Role.ROLE_CITIZEN,
                "+91 98201 12345",
                Instant.now().toString()
            );
            userRepository.save(citizenUser);
        }
    }

    public synchronized void seedAll() {
        incidentRepository.deleteAll();
        activityLogRepository.deleteAll();

        List<Incident> incidents = new ArrayList<>();

        incidents.add(new Incident(
            "MS-2026-101",
            "Multi-Vehicle Collision near BKC Connector Ramp",
            "Accident",
            "Two passenger sedans and an auto-rickshaw collided on the northbound entry ramp. Right lane blocked, emergency crane on scene. Ambulances dispatched.",
            "BKC Connector Ramp, Bandra East, Mumbai",
            19.0625, 72.8538,
            "Critical", "In Progress",
            "2026-10-27T08:15:00.000Z", "2026-10-27T08:45:00.000Z",
            "Vikram Mehta", "+91 98201 44521", "vikram.m@example.com", false,
            "Severe delays (~40 mins on Western Express Highway approach)",
            "Traffic Division 3 - BKC Rapid Response",
            "Tow truck en route. Diverting BKC inbound traffic via Kalanagar flyover."
        ));

        incidents.add(new Incident(
            "MS-2026-102",
            "Water Pipe Burst & Cave-in on SV Road",
            "Damaged Road",
            "Sub-surface BMC water supply pipe ruptured overnight, causing a 3-meter road depression near Bandra Talao. Water accumulation across both southbound lanes.",
            "SV Road, opposite Bandra Talao, Bandra West, Mumbai",
            19.0560, 72.8398,
            "High", "Reported",
            "2026-10-27T07:20:00.000Z", "2026-10-27T07:20:00.000Z",
            "Pooja Bhatt", null, "pbhatt.citizen@example.com", false,
            "Major bottleneck, single lane alternating traffic",
            "MCGM H-West Ward Engineering",
            "Inspection team notified. Barricades requested from Bandra traffic police."
        ));

        incidents.add(new Incident(
            "MS-2026-103",
            "Heavy Gridlock on Western Express Highway near Domestic Airport",
            "Traffic Congestion",
            "Slow-moving commuter traffic due to peak flight arrivals and broken-down intercity bus near the airport underpass.",
            "WEH, Vile Parle East Flyover Junction, Mumbai",
            19.0988, 72.8542,
            "High", "In Progress",
            "2026-10-27T09:05:00.000Z", "2026-10-27T09:30:00.000Z",
            "Aditya Kulkarni", "+91 97692 88310", null, false,
            "35 mins delay toward Bandra",
            "Airport Traffic Chowky Unit 2",
            "Bus cleared to service lane. Green corridor timing activated on signal."
        ));

        incidents.add(new Incident(
            "MS-2026-104",
            "BEST Electric Bus Breakdown at Dadar TT Circle",
            "Public Transport Delay",
            "Route 115 AC bus experienced traction motor lock in the center roundabout, holding up trams/feeder buses and south-bound cabs.",
            "Dadar TT Circle, Dr. Ambedkar Road, Dadar East, Mumbai",
            19.0178, 72.8478,
            "Medium", "In Progress",
            "2026-10-27T08:50:00.000Z", "2026-10-27T09:15:00.000Z",
            "Rohan Salvi", null, null, false,
            "Medium congestion at roundabout, delays on Route 66 and 115",
            "BEST Central Fleet Recovery Unit",
            "Heavy tow-truck positioned. Expect clearance in 20 minutes."
        ));

        incidents.add(new Incident(
            "MS-2026-105",
            "Fallen Banyan Tree Branch Blocking Footpath & Pedestrian Ramp",
            "Footpath / Accessibility",
            "Overgrown branch snapped during morning winds, completely blocking pedestrian walkway and wheelchair tactile path outside Hinduja College.",
            "Near Hinduja Hospital / Charni Road Station approach, Mumbai",
            18.9515, 72.8188,
            "Medium", "Reported",
            "2026-10-27T06:40:00.000Z", "2026-10-27T06:40:00.000Z",
            "Ananya Sharma", null, null, false,
            "Pedestrians forced onto active vehicular road",
            "BMC Garden & Tree Authority Dept",
            "Awaiting woodcutters from Ward D office."
        ));

        incidents.add(new Incident(
            "MS-2026-106",
            "Metro Line 3 Surface Restoration Barricade Overhang",
            "Road Blockage",
            "Construction metal barricades have shifted 1.5m into the active carriageway due to gusty winds near Hutatma Chowk.",
            "Flora Fountain / Hutatma Chowk, Fort, Mumbai",
            18.9322, 72.8335,
            "Critical", "In Progress",
            "2026-10-27T09:12:00.000Z", "2026-10-27T09:40:00.000Z",
            "Farhan Contractor", "+91 99300 12040", null, false,
            "Severe hazard to two-wheelers during turns",
            "MMRC Project Safety Marshal Division",
            "Site engineer instructed to reinforce anchors immediately."
        ));

        incidents.add(new Incident(
            "MS-2026-107",
            "Severe Potholes & Cratering on JVLR near IIT Powai Gate",
            "Damaged Road",
            "Cluster of deep rainwater-filled potholes across the center lane causing sharp braking and two-wheeler skids.",
            "Jogeshwari-Vikhroli Link Road, opposite IIT Main Gate, Powai, Mumbai",
            19.1254, 72.9150,
            "High", "Reported",
            "2026-10-27T07:55:00.000Z", "2026-10-27T07:55:00.000Z",
            "Kavita Nair", null, "knair.powai@example.com", false,
            "Slow flow between Kanjurmarg and Powai",
            "S Ward Maintenance Division",
            "Cold-mix asphalt patch team scheduled for night shift."
        ));

        incidents.add(new Incident(
            "MS-2026-108",
            "Cargo Truck Axle Breakdown on Eastern Freeway Northbound",
            "Road Blockage",
            "Heavy container vehicle stranded near Bhakti Park exit. Right shoulder and one express lane blocked.",
            "Eastern Freeway near Wadala Bhakti Park Exit, Mumbai",
            19.0312, 72.8795,
            "Critical", "In Progress",
            "2026-10-27T08:30:00.000Z", "2026-10-27T09:20:00.000Z",
            "Deepak Joshi", null, null, false,
            "Freeway speeds reduced from 80 km/h to 15 km/h over 3km stretch",
            "Freeway Highway Patrol - Wadala Base",
            "Heavy 40-ton crane on site. Safe winching underway."
        ));

        incidents.add(new Incident(
            "MS-2026-109",
            "Broken Storm Drain Grate on Marine Drive Promenade Crosswalk",
            "Footpath / Accessibility",
            "Cast iron storm grate has collapsed inward by 20cm at zebra crossing. Dangerous trip hazard for elderly pedestrians and morning joggers.",
            "Marine Drive Promenade, opposite Pizza By The Bay, Churchgate, Mumbai",
            18.9340, 72.8229,
            "Medium", "Resolved",
            "2026-10-26T16:00:00.000Z", "2026-10-27T08:00:00.000Z",
            "Sunil Gavaskar Colony Resident", null, null, true,
            "Pedestrian safety restored",
            "MCGM A-Ward Civil Works",
            "Heavy-duty ductile replacement grate installed and welded at 07:45 AM."
        ));

        incidents.add(new Incident(
            "MS-2026-110",
            "Toll Plaza Lane 4 Tag Scanner Failure at Bandra-Worli Sea Link",
            "Traffic Congestion",
            "Automated FASTag reader offline at Northbound toll booth #4, forcing manual cash collection and queue spillage onto Worli seaface approach.",
            "Bandra-Worli Sea Link Toll Plaza, Worli side, Mumbai",
            19.0222, 72.8155,
            "Medium", "Resolved",
            "2026-10-26T18:30:00.000Z", "2026-10-27T07:10:00.000Z",
            "Amitabh Sen", null, null, false,
            "Normal clearance resumed",
            "MSRDC Toll Systems Tech Team",
            "RFID reader replaced and recalibrated. Flow returned to baseline."
        ));

        incidents.add(new Incident(
            "MS-2026-111",
            "Auto-rickshaw Parking Encroachment at Kurla Station West",
            "Other",
            "Unregulated three-wheelers double-parked along the station feeder road, blocking BEST feeder bus turnaround bay.",
            "Station Road, Kurla West railway station concourse, Mumbai",
            19.0682, 72.8790,
            "Low", "Reported",
            "2026-10-27T10:00:00.000Z", "2026-10-27T10:00:00.000Z",
            "Meena Iyer", null, null, false,
            "Minor bus boarding delays during peak commuter hours",
            "Kurla Traffic Sub-Division",
            "Traffic wardens assigned for lane enforcement."
        ));

        incidents.add(new Incident(
            "MS-2026-112",
            "Non-Functional Pedestrian Pelican Crossing Signal",
            "Footpath / Accessibility",
            "Pedestrian push-button signal permanently stuck on red at high-speed crossing near Inorbit Mall link road. Coordinates pending field geocode verification.",
            "New Link Road, near Inorbit Mall main signal, Malad West, Mumbai",
            null, null,
            "Low", "Reported",
            "2026-10-27T10:25:00.000Z", "2026-10-27T10:25:00.000Z",
            "Citizens for Safe Malad", null, "contact@safemalad.org", false,
            "Pedestrians waiting upwards of 7 minutes to cross safely",
            "Mumbai Traffic Control Signal Dept",
            "Awaiting coordinate verification from area officer."
        ));

        int trkIndex = 10101;
        for (Incident inc : incidents) {
            inc.setTrackingId("MS-TRK-" + trkIndex++);
            if (inc.getPublicUpdate() == null) {
                if ("Resolved".equalsIgnoreCase(inc.getStatus())) {
                    inc.setPublicUpdate("Incident verified, work completed by assigned civil response unit, and site cleared.");
                } else if ("In Progress".equalsIgnoreCase(inc.getStatus())) {
                    inc.setPublicUpdate("Assigned to active field response team. Remediation is underway.");
                } else {
                    inc.setPublicUpdate("Complaint registered in operations queue and awaiting verification.");
                }
            }
        }

        incidentRepository.saveAll(incidents);

        List<ActivityLog> activities = new ArrayList<>();
        activities.add(new ActivityLog(
            "ACT-INIT-01", "INCIDENT_SUBMITTED", "MS-2026-101",
            "Multi-Vehicle Collision near BKC",
            "Reported by citizen Vikram Mehta with Critical severity",
            "2026-10-27T08:15:00.000Z", "Citizen (Vikram Mehta)", null, "Reported"
        ));
        activities.add(new ActivityLog(
            "ACT-INIT-02", "STATUS_UPDATED", "MS-2026-101",
            "Status changed to In Progress",
            "Assigned to Traffic Division 3 - BKC Rapid Response",
            "2026-10-27T08:45:00.000Z", "Admin (Control Room 04)", "Reported", "In Progress"
        ));
        activities.add(new ActivityLog(
            "ACT-INIT-03", "INCIDENT_RESOLVED", "MS-2026-109",
            "Broken Storm Drain Grate Resolved",
            "MCGM A-Ward Civil Works installed replacement ductile grate",
            "2026-10-27T08:00:00.000Z", "Admin (Ward Engineer)", "In Progress", "Resolved"
        ));
        activities.add(new ActivityLog(
            "ACT-INIT-04", "INCIDENT_RESOLVED", "MS-2026-110",
            "Sea Link Toll Lane 4 Cleared",
            "FASTag sensor recalibrated and operational",
            "2026-10-27T07:10:00.000Z", "Admin (MSRDC Control)", "In Progress", "Resolved"
        ));

        activityLogRepository.saveAll(activities);
    }
}

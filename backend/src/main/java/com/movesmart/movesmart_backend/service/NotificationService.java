package com.movesmart.movesmart_backend.service;

import com.movesmart.movesmart_backend.dto.NotificationDto;
import com.movesmart.movesmart_backend.model.Notification;
import com.movesmart.movesmart_backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public NotificationDto createNotification(String userId, String incidentId, String title, String message, String type) {
        String id = "NOTIF-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
        Notification notification = new Notification(
                id,
                userId,
                incidentId,
                title,
                message,
                type,
                false,
                Instant.now().toString()
        );
        Notification saved = notificationRepository.save(notification);
        return NotificationDto.fromEntity(saved);
    }

    public List<NotificationDto> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public Optional<NotificationDto> markAsRead(String notificationId, String userId) {
        return notificationRepository.findByIdAndUserId(notificationId, userId).map(notif -> {
            notif.setRead(true);
            return NotificationDto.fromEntity(notificationRepository.save(notif));
        });
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : unread) {
            if (!n.isRead()) {
                n.setRead(true);
            }
        }
        notificationRepository.saveAll(unread);
    }
}

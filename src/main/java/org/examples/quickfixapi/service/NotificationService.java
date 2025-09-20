package org.examples.quickfixapi.service;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.entity.Notification;
import org.examples.quickfixapi.entity.NotificationType;
import org.examples.quickfixapi.entity.Role;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.respository.NotificationRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;


    public void notifyAdminsAboutProviderRequest(Long userId) {
        List<User> admins = userRepository.findAll()
                .stream()
                .filter(user -> "SUPER_ADMIN".equals(user.getRole().toString()))
                .toList();

        for (User admin : admins) {
            createNotification(
                    admin.getId(),
                    "User #" + userId + " has requested to become a service provider",
                    NotificationType.PROVIDER_REQUEST,
                    false
            );
        }
    }

    // Create a new notification
    public void createNotification(Long userId, String message, NotificationType type, boolean sendEmail) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setType(type); // SYSTEM, PROVIDER_REQUEST, etc.
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

        if (sendEmail) {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            emailService.sendEmail(user.getEmail(), type.name().replace("_", " "), message);
        }
    }

    // Overload without sendEmail (defaults to false)
    public void createNotification(Long userId, String message, NotificationType type) {
        createNotification(userId, message, type, false);
    }

    // get only unread notifications
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }


    // get all notifications sorted by latest first
    public List<Notification> getAllNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }


    // mark a single notification as read
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }

    // mark a single notification as un read
    public void markAsUnread(Long id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setIsRead(false);
            notificationRepository.save(notification);
        });
    }

    // Mark all notifications as read (bulk save)
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        if (!unread.isEmpty()) {
            unread.forEach(n -> n.setIsRead(true));
            notificationRepository.saveAll(unread); // bulk update
        }
    }

    // Count how many unread notifications a user has
    public int getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

}
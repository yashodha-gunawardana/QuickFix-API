package org.examples.quickfixapi.service;

import org.examples.quickfixapi.entity.Notification;
import org.examples.quickfixapi.entity.Role;
import org.examples.quickfixapi.entity.User;
import org.examples.quickfixapi.respository.NotificationRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


@Service
public class NotificationService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public NotificationService(UserRepository userRepository, NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    public void notifyAdminsAboutProviderRequest(Long userId) {
        List<User> admins = userRepository.findAll()
                .stream()
                .filter(user -> "SUPER_ADMIN".equals(user.getRole().toString()))
                .toList();

        for (User admin : admins) {
            createNotification(
                    admin.getId(),
                    "User #" + userId + " has requested to become a service provider",
                    "PROVIDER_REQUEST"
            );
        }
    }

    // Create a new notification
    public void createNotification(Long userId, String message, String type) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setMessage(message);
        notification.setType(type); // SYSTEM, PROVIDER_REQUEST, etc.
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
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


    // Count how many unread notifications a user has
    public int getUnreadNotificationCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

}
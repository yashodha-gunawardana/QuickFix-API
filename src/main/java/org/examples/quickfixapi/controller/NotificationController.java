package org.examples.quickfixapi.controller;

import lombok.RequiredArgsConstructor;
import org.examples.quickfixapi.entity.Notification;
import org.examples.quickfixapi.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;


    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationService.getUnreadNotifications(userId);
    }

    @GetMapping("/user/{userId}/all")
    public List<Notification> getAllUserNotifications(@PathVariable Long userId) {
        return notificationService.getAllNotifications(userId);
    }

    @GetMapping("/user/{userId}/count")
    public Map<String, Integer> getUnreadNotificationCount(@PathVariable Long userId) {
        int count = notificationService.getUnreadNotificationCount(userId);
        return Map.of("count", count);
    }

    @PostMapping("/{id}/read")
    public Map<String, String> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return Map.of("message", "Notification marked as read");
    }

    @PostMapping("/{id}/unread")
    public Map<String, String> markAsUnread(@PathVariable Long id) {
        notificationService.markAsUnread(id);
        return Map.of("message", "Notification marked as unread");
    }

    /*@PostMapping("/user/{userId}/read-all")
    public Map<String, String> markAllAsRead(@PathVariable Long userId) {
       /* List<Notification> unreadNotifications = notificationService.getUnreadNotifications(userId);
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            // Optional: save in bulk for performance
        });
        return Map.of("message", "All notifications marked as read");

    }*/
    @PostMapping("/user/{userId}/read-all")
    public Map<String, String> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return Map.of("message", "All notifications marked as read");
    }


}
package org.examples.quickfixapi.controller;

import org.examples.quickfixapi.entity.Notification;
import org.examples.quickfixapi.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }


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

}
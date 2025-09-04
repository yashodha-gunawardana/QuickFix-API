package org.examples.quickfixapi.controller;

import org.examples.quickfixapi.entity.Notification;
import org.examples.quickfixapi.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


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

}
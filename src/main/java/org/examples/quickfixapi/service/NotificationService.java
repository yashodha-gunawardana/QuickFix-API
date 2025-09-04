package org.examples.quickfixapi.service;

import org.examples.quickfixapi.respository.NotificationRepository;
import org.examples.quickfixapi.respository.UserRepository;
import org.springframework.stereotype.Service;


@Service
public class NotificationService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public NotificationService(UserRepository userRepository, NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }





}
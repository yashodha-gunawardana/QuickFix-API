package org.examples.quickfixapi.respository;

import org.examples.quickfixapi.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdAndIsReadFalse(Long userId);
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    int countByUserIdAndIsReadFalse(Long userId);
}
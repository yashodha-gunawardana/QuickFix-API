package org.examples.quickfixapi.respository;

import org.examples.quickfixapi.entity.ProviderRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProviderRequestRepository  extends JpaRepository<ProviderRequest, Long> {
    boolean existsByUserIdAndStatus(Long userId, String status);
}
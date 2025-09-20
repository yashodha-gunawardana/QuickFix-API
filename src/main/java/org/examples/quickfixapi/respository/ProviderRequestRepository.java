package org.examples.quickfixapi.respository;

import aj.org.objectweb.asm.commons.Remapper;
import org.examples.quickfixapi.entity.ProviderRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderRequestRepository  extends JpaRepository<ProviderRequest, Long> {
    boolean existsByUserIdAndStatus(Long userId, String status);
    Optional<ProviderRequest> findByUserIdAndStatus(Long userId, String status);
    List<ProviderRequest> findByStatus(String status);
}
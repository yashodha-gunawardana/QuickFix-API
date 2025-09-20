package org.examples.quickfixapi.respository;

import org.examples.quickfixapi.entity.ProviderProfile;
import org.examples.quickfixapi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {
    Optional<ProviderProfile> findByUserId(Long userId);

}

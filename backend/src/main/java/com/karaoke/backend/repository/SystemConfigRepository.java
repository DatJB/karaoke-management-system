package com.karaoke.backend.repository;

import com.karaoke.backend.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Integer>
{
    Optional<SystemConfig> findByConfigKey(String rsaMasterPublicKey);
}

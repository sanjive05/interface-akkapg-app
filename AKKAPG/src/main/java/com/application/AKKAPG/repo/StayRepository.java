package com.application.AKKAPG.repo;

import com.application.AKKAPG.entity.Stay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StayRepository extends JpaRepository<Stay,Long> {
}

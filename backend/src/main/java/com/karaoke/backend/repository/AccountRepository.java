package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Integer>
{
    Optional<Account> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByUsernameAndIdNot(String username, Integer id);

    @Query("""
            select a from Account a
            left join a.employee e
            where (:search is null or :search = ''
                   or lower(a.username) like lower(concat('%', :search, '%'))
                   or lower(coalesce(e.name, '')) like lower(concat('%', :search, '%')))
            """)
    Page<Account> search(@Param("search") String search, Pageable pageable);
}

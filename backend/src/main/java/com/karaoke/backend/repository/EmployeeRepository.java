package com.karaoke.backend.repository;

import com.karaoke.backend.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmployeeRepository extends JpaRepository<Employee, Integer>
{
    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Integer id);

    @Query("""
            select e from Employee e
            left join e.account a
            where (:search is null or :search = ''
                   or lower(e.name) like lower(concat('%', :search, '%'))
                   or lower(coalesce(e.code, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(e.phone, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(a.username, '')) like lower(concat('%', :search, '%')))
            """)
    Page<Employee> search(@Param("search") String search, Pageable pageable);
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    Optional<Employee> findByAccountUsername(String username);
}

package vu.software_project.sdp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vu.software_project.sdp.entities.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
}
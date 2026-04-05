package com.application.AKKAPG.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long billId;

    @ManyToOne
    @JoinColumn(name = "stay_id")
    private Stay stay;

    private Double rentAmount;
    private Double electricityAmount;
    private Double totalAmount;

    private String month; // e.g., "APR-2026"

    @OneToMany(mappedBy = "bill")
    private List<Payment> payments;
}
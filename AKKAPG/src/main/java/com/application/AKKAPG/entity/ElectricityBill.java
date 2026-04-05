package com.application.AKKAPG.entity;

import jakarta.persistence.*;

@Entity
public class ElectricityBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long electricityBillId;

    @ManyToOne
    @JoinColumn(name = "roomId")
    private Room room;

    private Double totalAmount;

    private String month;
}
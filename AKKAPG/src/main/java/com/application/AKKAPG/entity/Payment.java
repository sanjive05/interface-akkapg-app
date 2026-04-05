package com.application.AKKAPG.entity;

import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @ManyToOne
    @JoinColumn(name = "bill_id")
    private Bill bill;

    private Double amountPaid;

    private Date paymentDate;

    private String paymentMode; // UPI / CASH / BANK
}
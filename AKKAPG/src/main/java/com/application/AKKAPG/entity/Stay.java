package com.application.AKKAPG.entity;

import jakarta.persistence.*;

import java.util.Date;
import java.util.List;

@Entity
public class Stay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stayId;

    @ManyToOne
    @JoinColumn(name = "guestId")
    private Guest guest;

    @ManyToOne
    @JoinColumn(name = "roomId")
    private Room room;

    private Date joiningDate;
    private Date vacatingDate;

    private Boolean status; // Active / Inactive

    @OneToMany(mappedBy = "stay")
    private List<Bill> bills;
}
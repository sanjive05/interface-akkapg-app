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
    @JoinColumn(name = "guest_id")
    private Guest guest;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;

    private Date joiningDate;
    private Date vacatingDate;

    private Boolean status; // Active / Inactive

    @OneToMany(mappedBy = "stay")
    private List<Bill> bills;
}
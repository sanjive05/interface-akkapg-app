package com.application.AKKAPG.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
@Entity
@Data
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    String roomId;
    String roomNo;
    int max_occupancy;
    Boolean isAc;
    Double rentAmount;
    @OneToMany(mappedBy = "room")
    private List<Stay> stays;

}

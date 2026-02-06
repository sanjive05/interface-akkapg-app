package com.application.AKKAPG.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
@Data
@Entity
public class Guest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long guestId;
    String name;
    @Enumerated(EnumType.STRING)
    Gender gender;
    int age;
    Date dateOfBirth;
    Date date;
    String phoneNo;
    String email;
    String address;
    String city;
    String AadhaarNo;
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    Room room;
    Date JoiningDate;
    Date vacatingDate;
    Boolean status;
    Double advancePaid;

    //root@127.0.0.1:3306
}

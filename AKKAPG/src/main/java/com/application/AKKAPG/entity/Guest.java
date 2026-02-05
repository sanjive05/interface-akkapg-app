package com.application.AKKAPG.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

import java.util.Date;
@Data
@Entity
public class Guest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long guestId;
    String name;
    Gender gender;
    int age;
    Date dateOfBirth;
    Date date;
    String phoneNo;
    String email;
    String address;
    String city;
    String AadhaarNo;
    String roomId;
    Date JoiningDate;
    Date vacatingDate;
    Boolean status;
    Double advancePaid;

    //root@127.0.0.1:3306
}

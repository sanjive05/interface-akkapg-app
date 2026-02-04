package com.application.AKKAPG.entity;

import lombok.Data;

import java.util.Date;
@Data
public class Guest {
    String guestId;
    String name;
    int age;
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

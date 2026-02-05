package com.application.AKKAPG.controller;

import com.application.AKKAPG.entity.Guest;
import com.application.AKKAPG.repo.GuestRepository;
import com.application.AKKAPG.service.GuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class GuestController {

    @Autowired
    private GuestService guestService;

    @GetMapping("/guests")
    public ResponseEntity<List<Guest>> getAllGuest(){
        List<Guest> guests = guestService.getAllGuests();
        return new ResponseEntity<>(guests, HttpStatus.OK);
    }


    @PostMapping("/addGuests")
    public ResponseEntity<String> addGuest(@RequestBody Guest guest) {

        Guest isAdd = guestService.addGuest(guest);
        System.out.println(isAdd.toString());

        if (isAdd.getGuestId() != 0) {
            return new ResponseEntity<>("Guest added "+isAdd.getGuestId(), HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>("Guest not added", HttpStatus.NOT_ACCEPTABLE);
        }
    }





}

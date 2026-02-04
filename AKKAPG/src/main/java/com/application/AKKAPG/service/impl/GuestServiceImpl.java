package com.application.AKKAPG.service.impl;

import com.application.AKKAPG.entity.Guest;
import com.application.AKKAPG.service.GuestService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GuestServiceImpl implements GuestService {
    List<Guest> guests = new ArrayList<>();
    @Override
    public List<Guest> getAllGuests() {
        return guests;
    }

    @Override
    public boolean addGuest(Guest guest) {
        return guests.add(guest);
    }
}

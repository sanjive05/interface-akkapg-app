package com.application.AKKAPG.service.impl;

import com.application.AKKAPG.entity.Guest;
import com.application.AKKAPG.repo.GuestRepository;
import com.application.AKKAPG.service.GuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GuestServiceImpl implements GuestService {

    @Autowired
    private GuestRepository guestRepository;
    List<Guest> guests = new ArrayList<>();
    @Override
    public List<Guest> getAllGuests() {
        return guestRepository.findAll();
    }

    @Override
    public Guest addGuest(Guest guest) {
        return guestRepository.save(guest);
    }
}

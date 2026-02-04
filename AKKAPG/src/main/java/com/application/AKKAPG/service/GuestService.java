package com.application.AKKAPG.service;

import com.application.AKKAPG.entity.Guest;
import org.springframework.stereotype.Service;

import java.util.List;

public interface GuestService {

    public List<Guest> getAllGuests();

    public boolean addGuest(Guest guest);

}

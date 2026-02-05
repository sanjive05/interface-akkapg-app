package com.application.AKKAPG.service;

import com.application.AKKAPG.entity.Guest;


import java.util.List;

public interface GuestService {

    public List<Guest> getAllGuests();

    public Guest addGuest(Guest guest);

}

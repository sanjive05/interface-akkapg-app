import axios from "axios";

const BASE_URL = "http://localhost:8080";

export const getAllGuests = () =>
  axios.get(`${BASE_URL}/guests`);

export const addGuest = (guest) =>
  axios.post(`${BASE_URL}/addGuests`, guest);

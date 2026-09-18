package com.redcinema.mrs.constants;

public interface ExceptionConstants {

    // User
    String USER_NOT_FOUND             = "The user with the specified ID was not found.";
    String USER_NOT_FOUND_BY_USERNAME = "The user with the specified username was not found.";
    String USER_ALREADY_EXISTS        = "A user with the same username or email already exists.";

    // Movie
    String MOVIE_NOT_FOUND            = "The movie with the specified ID was not found.";

    // Theatre
    String THEATRE_NOT_FOUND          = "The theatre with the specified ID was not found.";

    // Screen
    String SCREEN_NOT_FOUND           = "The screen with the specified ID was not found.";

    // Show
    String SHOW_NOT_FOUND             = "The show with the specified ID was not found.";

    // Reservation
    String RESERVATION_NOT_FOUND       = "The reservation with the specified ID was not found.";
    String RESERVATION_NOT_CANCELLABLE = "This reservation cannot be cancelled — the show starts in less than 30 minutes.";

    // Seat
    String AVAILABLE_SHOW_SEATS_NOT_FOUND = "One or more selected seats are no longer available.";
    String SEAT_ALREADY_LOCKED            = "One or more seats are currently being booked by another user. Please try again.";
}

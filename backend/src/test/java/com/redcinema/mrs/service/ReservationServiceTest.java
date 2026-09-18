package com.redcinema.mrs.service;

import com.redcinema.mrs.dto.reservation.ReservationRequestDTO;
import com.redcinema.mrs.dto.showseat.ShowSeatRequestDTO;
import com.redcinema.mrs.entity.*;
import com.redcinema.mrs.enums.*;
import com.redcinema.mrs.exception.AvailableShowSeatsNotFoundException;
import com.redcinema.mrs.exception.ReservationNotCancellableException;
import com.redcinema.mrs.exception.SeatAlreadyLockedException;
import com.redcinema.mrs.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReservationService unit tests — bug-fix verification")
class ReservationServiceTest {

    @Mock ReservationRepository reservationRepository;
    @Mock UserService userService;
    @Mock ShowService showService;
    @Mock ShowSeatService showSeatService;
    @Mock TheatreService theatreService;

    @InjectMocks ReservationService reservationService;

    private User user;
    private Theatre theatre;
    private Movie movie;
    private Show show;
    private Seat seat;
    private ShowSeat showSeat;

    @BeforeEach
    void setUp() {
        user = User.builder().userId(1L).username("alice").userRole(UserRole.ROLE_USER)
                .userStatus(UserStatus.ACTIVE).build();

        theatre = Theatre.builder().theatreId(1L).theatreName("PVR")
                .totalRevenue(0.0).totalBookings(0).build();

        movie = Movie.builder().movieId(1L).movieName("Inception").build();

        show = Show.builder().showId(1L).movie(movie).theatre(theatre)
                .startTime(LocalDateTime.now().plusHours(3))
                .endTime(LocalDateTime.now().plusHours(6))
                .build();

        seat = Seat.builder().seatId(1L).rowId(1).seatNumber(1)
                .seatType(SeatType.SINGLE).seatPrice(300.0).build();

        showSeat = ShowSeat.builder().showSeatId(10L).seat(seat)
                .seatStatus(SeatStatus.AVAILABLE).show(show).build();
    }

    // ── createReservation ─────────────────────────────────────────────────────

    @Test
    @DisplayName("createReservation — happy path updates theatre revenue correctly")
    void createReservation_updatesRevenue() {
        ReservationRequestDTO dto = buildDto(10L);

        doNothing().when(showSeatService).acquireLocks(anyList());
        when(showSeatService.getAvailableShowSeats(anyList())).thenReturn(List.of(showSeat));
        when(showSeatService.bookSeats(anyList())).thenReturn(300.0);
        when(userService.getUserById(1L)).thenReturn(user);
        when(showService.getShowById(1L)).thenReturn(show);
        when(reservationRepository.save(any())).thenAnswer(i -> {
            Reservation r = i.getArgument(0);
            // simulate id assignment
            return Reservation.builder()
                    .reservationId(99L).user(r.getUser()).show(r.getShow())
                    .seatsReserved(r.getSeatsReserved()).totalAmount(r.getTotalAmount())
                    .reservationStatus(ReservationStatus.BOOKED).build();
        });
        when(theatreService.save(any())).thenAnswer(i -> i.getArgument(0));

        Reservation result = reservationService.createReservation(dto);

        assertThat(result.getTotalAmount()).isEqualTo(300.0);
        assertThat(theatre.getTotalRevenue()).isEqualTo(300.0);
        assertThat(theatre.getTotalBookings()).isEqualTo(1);
        verify(showSeatService).releaseLocks(anyList());
    }

    @Test
    @DisplayName("createReservation — releases locks even on seat-unavailable exception")
    void createReservation_releasesLocksOnFailure() {
        ReservationRequestDTO dto = buildDto(10L);

        doNothing().when(showSeatService).acquireLocks(anyList());
        when(showSeatService.getAvailableShowSeats(anyList())).thenReturn(List.of());

        assertThatThrownBy(() -> reservationService.createReservation(dto))
                .isInstanceOf(AvailableShowSeatsNotFoundException.class);

        // Locks must be released in the finally block even after the exception
        verify(showSeatService).releaseLocks(anyList());
    }

    @Test
    @DisplayName("createReservation — propagates SeatAlreadyLockedException from acquireLocks")
    void createReservation_lockContention() {
        ReservationRequestDTO dto = buildDto(10L);
        doThrow(new SeatAlreadyLockedException("Seat locked", org.springframework.http.HttpStatus.CONFLICT))
                .when(showSeatService).acquireLocks(anyList());

        assertThatThrownBy(() -> reservationService.createReservation(dto))
                .isInstanceOf(SeatAlreadyLockedException.class);
    }

    // ── cancelReservation ─────────────────────────────────────────────────────

    @Test
    @DisplayName("cancelReservation — correctly SUBTRACTS bookings (bug-fix verification)")
    void cancelReservation_subtractsBookings() {
        theatre.setTotalBookings(5);
        theatre.setTotalRevenue(1500.0);

        Reservation reservation = Reservation.builder()
                .reservationId(1L)
                .show(show)
                .user(user)
                .seatsReserved(List.of(showSeat))
                .totalAmount(300.0)
                .reservationStatus(ReservationStatus.BOOKED)
                .build();

        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(theatreService.save(any())).thenAnswer(i -> i.getArgument(0));

        boolean result = reservationService.cancelReservation(1L);

        assertThat(result).isTrue();
        assertThat(reservation.getReservationStatus()).isEqualTo(ReservationStatus.CANCELLED);
        // Revenue must decrease
        assertThat(theatre.getTotalRevenue()).isEqualTo(1200.0);
        // Bookings must DECREASE (original bug added instead of subtracting)
        assertThat(theatre.getTotalBookings()).isEqualTo(4);
        verify(showSeatService).releaseSeats(anyList());
    }

    @Test
    @DisplayName("cancelReservation — returns false when already cancelled")
    void cancelReservation_alreadyCancelled() {
        Reservation reservation = Reservation.builder()
                .reservationId(2L)
                .show(show)
                .reservationStatus(ReservationStatus.CANCELLED)
                .build();

        when(reservationRepository.findById(2L)).thenReturn(Optional.of(reservation));

        boolean result = reservationService.cancelReservation(2L);
        assertThat(result).isFalse();
        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancelReservation — throws when show starts in < 30 minutes")
    void cancelReservation_tooLate() {
        // Show starts in 10 minutes — not cancellable
        show = Show.builder().showId(2L).movie(movie).theatre(theatre)
                .startTime(LocalDateTime.now().plusMinutes(10))
                .endTime(LocalDateTime.now().plusMinutes(130))
                .build();

        Reservation reservation = Reservation.builder()
                .reservationId(3L).show(show).user(user)
                .seatsReserved(List.of(showSeat)).totalAmount(300.0)
                .reservationStatus(ReservationStatus.BOOKED)
                .build();

        when(reservationRepository.findById(3L)).thenReturn(Optional.of(reservation));

        assertThatThrownBy(() -> reservationService.cancelReservation(3L))
                .isInstanceOf(ReservationNotCancellableException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private ReservationRequestDTO buildDto(Long showSeatId) {
        ShowSeatRequestDTO seatDto = new ShowSeatRequestDTO();
        seatDto.setSeatId(showSeatId);

        ReservationRequestDTO dto = new ReservationRequestDTO();
        dto.setUserId(1L);
        dto.setShowId(1L);
        dto.setShowSeats(List.of(seatDto));
        return dto;
    }
}

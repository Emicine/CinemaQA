package com.redcinema.mrs.service;

import com.redcinema.mrs.constants.ExceptionConstants;
import com.redcinema.mrs.dto.screen.ScreenRequestDTO;
import com.redcinema.mrs.entity.Screen;
import com.redcinema.mrs.entity.Seat;
import com.redcinema.mrs.entity.Theatre;
import com.redcinema.mrs.exception.ScreenNotFoundException;
import com.redcinema.mrs.repository.ScreenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScreenService {

    private final ScreenRepository screenRepository;
    private final SeatService seatService;

    public Screen getScreenById(Long screenId) {
        return screenRepository.findById(screenId)
                .orElseThrow(() -> new ScreenNotFoundException(
                        ExceptionConstants.SCREEN_NOT_FOUND,
                        HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Screen createScreen(Theatre theatre, ScreenRequestDTO dto) {

        // Persist screen first so seats can reference it
        Screen screen = Screen.builder()
                .screenName(dto.getScreenName())
                .theatre(theatre)
                .seats(new ArrayList<>())
                .build();

        screen = screenRepository.save(screen);

        List<Seat> seats = new ArrayList<>();

        for (var seatDto : dto.getSeats()) {
            seats.add(seatService.createSeat(screen, seatDto));
        }

        screen.setSeats(seats);

        return screenRepository.save(screen);
    }

    public Long getTheatreIdByScreenId(Long screenId) {
        return screenRepository.findTheatreIdByScreenId(screenId);
    }
}
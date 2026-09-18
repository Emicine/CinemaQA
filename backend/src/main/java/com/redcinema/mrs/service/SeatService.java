package com.redcinema.mrs.service;

import com.redcinema.mrs.dto.seat.SeatRequestDTO;
import com.redcinema.mrs.entity.Screen;
import com.redcinema.mrs.entity.Seat;
import com.redcinema.mrs.enums.SeatType;
import com.redcinema.mrs.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;

    @Transactional
    public Seat createSeat(Screen screen, SeatRequestDTO dto) {
        Seat seat = Seat.builder()
                .rowId(dto.getRowId())
                .seatNumber(dto.getSeatNumber())
                .seatType(SeatType.valueOf(dto.getSeatType()))
                .seatPrice(dto.getSeatPrice())
                .screen(screen)
                .build();
        return seatRepository.save(seat);
    }
}

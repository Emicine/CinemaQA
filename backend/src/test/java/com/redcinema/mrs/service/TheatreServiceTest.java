package com.redcinema.mrs.service;

import com.redcinema.mrs.dto.screen.ScreenRequestDTO;
import com.redcinema.mrs.dto.theatre.TheatreRequestDTO;
import com.redcinema.mrs.dto.user.TheatreAdminRequestDTO;
import com.redcinema.mrs.entity.*;
import com.redcinema.mrs.enums.UserRole;
import com.redcinema.mrs.enums.UserStatus;
import com.redcinema.mrs.exception.TheatreNotFoundException;
import com.redcinema.mrs.exception.UserConflictException;
import com.redcinema.mrs.repository.TheatreRepository;
import com.redcinema.mrs.repository.TheatreVsAdminRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TheatreService unit tests")
class TheatreServiceTest {

    @Mock TheatreRepository theatreRepository;
    @Mock TheatreVsAdminRepository theatreVsAdminRepository;
    @Mock UserService userService;
    @Mock ScreenService screenService;

    @InjectMocks TheatreService theatreService;

    private User adminUser;
    private Theatre sampleTheatre;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .userId(10L).username("adminUser")
                .userRole(UserRole.ROLE_USER)
                .userStatus(UserStatus.ACTIVE)
                .build();

        sampleTheatre = Theatre.builder()
                .theatreId(1L)
                .theatreName("PVR IMAX")
                .theatreLocation("Mumbai")
                .totalScreens(2)
                .totalBookings(0)
                .totalRevenue(0.0)
                .theatreAdmins(new ArrayList<>())
                .screens(new ArrayList<>())
                .build();
    }

    // ── getTheatreById ────────────────────────────────────────────────────────

    @Test
    @DisplayName("getTheatreById — returns theatre when found")
    void getTheatreById_found() {
        when(theatreRepository.findById(1L)).thenReturn(Optional.of(sampleTheatre));
        Theatre result = theatreService.getTheatreById(1L);
        assertThat(result.getTheatreName()).isEqualTo("PVR IMAX");
    }

    @Test
    @DisplayName("getTheatreById — throws TheatreNotFoundException when missing")
    void getTheatreById_notFound() {
        when(theatreRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> theatreService.getTheatreById(99L))
                .isInstanceOf(TheatreNotFoundException.class);
    }

    // ── createTheatre ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("createTheatre — sets theatreLocation from DTO (bug-fix verification)")
    void createTheatre_locationSetCorrectly() {
        TheatreRequestDTO dto = new TheatreRequestDTO();
        dto.setTheatreName("INOX Megaplex");
        dto.setTheatreLocation("Delhi");          // must be persisted, not theatreName
        dto.setTheatreAdminId(10L);

        ScreenRequestDTO screenDto = new ScreenRequestDTO();
        screenDto.setScreenName("Screen 1");
        screenDto.setSeats(List.of());
        dto.setScreens(List.of(screenDto));

        when(userService.getUserById(10L)).thenReturn(adminUser);
        when(userService.promoteToTheatreAdmin(adminUser)).thenReturn(adminUser);
        when(screenService.createScreen(any(), any())).thenReturn(
                Screen.builder().screenId(1L).screenName("Screen 1").seats(List.of()).build());
        when(theatreRepository.save(any())).thenAnswer(inv -> {
            Theatre t = inv.getArgument(0);
            t.setTheatreId(5L);
            return t;
        });

        Theatre created = theatreService.createTheatre(dto);

        // Bug-fix: location must equal "Delhi", NOT the theatre name "INOX Megaplex"
        assertThat(created.getTheatreLocation()).isEqualTo("Delhi");
        assertThat(created.getTheatreName()).isEqualTo("INOX Megaplex");
        assertThat(created.getTotalScreens()).isEqualTo(1);
    }

    @Test
    @DisplayName("createTheatre — promotes admin user to THEATRE_ADMIN role")
    void createTheatre_promotesAdmin() {
        TheatreRequestDTO dto = new TheatreRequestDTO();
        dto.setTheatreName("Cinépolis");
        dto.setTheatreLocation("Bangalore");
        dto.setTheatreAdminId(10L);
        dto.setScreens(List.of());

        when(userService.getUserById(10L)).thenReturn(adminUser);
        when(userService.promoteToTheatreAdmin(adminUser)).thenReturn(adminUser);
        when(theatreRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        theatreService.createTheatre(dto);

        verify(userService).promoteToTheatreAdmin(adminUser);
    }

    // ── updateTheatre ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateTheatre — updates name and location")
    void updateTheatre() {
        TheatreRequestDTO dto = new TheatreRequestDTO();
        dto.setTheatreName("PVR Premium");
        dto.setTheatreLocation("Pune");
        dto.setTheatreAdminId(10L);
        dto.setScreens(List.of());

        when(theatreRepository.findById(1L)).thenReturn(Optional.of(sampleTheatre));
        when(theatreRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Theatre updated = theatreService.updateTheatre(1L, dto);

        assertThat(updated.getTheatreName()).isEqualTo("PVR Premium");
        assertThat(updated.getTheatreLocation()).isEqualTo("Pune");
    }

    // ── addTheatreAdmin ───────────────────────────────────────────────────────

    @Test
    @DisplayName("addTheatreAdmin — links user and promotes role")
    void addTheatreAdmin_success() {
        TheatreAdminRequestDTO dto = new TheatreAdminRequestDTO();
        dto.setTheatreId(1L);
        dto.setUserId(10L);

        when(theatreRepository.findById(1L)).thenReturn(Optional.of(sampleTheatre));
        when(userService.getUserById(10L)).thenReturn(adminUser);
        when(theatreVsAdminRepository.existsByTheatre_TheatreIdAndUser_UserId(1L, 10L))
                .thenReturn(false);
        when(userService.promoteToTheatreAdmin(adminUser)).thenReturn(adminUser);
        when(theatreRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Theatre result = theatreService.addTheatreAdmin(dto);

        assertThat(result.getTheatreAdmins()).hasSize(1);
        verify(userService).promoteToTheatreAdmin(adminUser);
    }

    @Test
    @DisplayName("addTheatreAdmin — throws when user is already an admin")
    void addTheatreAdmin_duplicate() {
        TheatreAdminRequestDTO dto = new TheatreAdminRequestDTO();
        dto.setTheatreId(1L);
        dto.setUserId(10L);

        when(theatreRepository.findById(1L)).thenReturn(Optional.of(sampleTheatre));
        when(userService.getUserById(10L)).thenReturn(adminUser);
        when(theatreVsAdminRepository.existsByTheatre_TheatreIdAndUser_UserId(1L, 10L))
                .thenReturn(true);

        assertThatThrownBy(() -> theatreService.addTheatreAdmin(dto))
                .isInstanceOf(UserConflictException.class);
    }

    // ── deleteTheatre ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteTheatre — delegates to repository")
    void deleteTheatre_success() {
        when(theatreRepository.findById(1L)).thenReturn(Optional.of(sampleTheatre));
        doNothing().when(theatreRepository).deleteById(1L);

        assertThatCode(() -> theatreService.deleteTheatre(1L)).doesNotThrowAnyException();
        verify(theatreRepository).deleteById(1L);
    }
}

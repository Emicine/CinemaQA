import requests
from tests_api_pytest.test_data import TEST_USER_ID

# TEST - TC057 - Un utilisateur peut accéder à ses propres réservations
# Vérifier qu'un utilisateur authentifié peut consulter ses réservations.

def test_user_can_access_own_reservations_tc_057(api_session, base_url, timeout, test_user_headers):

    # ACT : compteTest consulte ses propres réservations
    response = api_session.get(f"{base_url}/api/reservations/user/{TEST_USER_ID}/all",headers=test_user_headers,timeout=timeout)

    # ASSERT : vérifier la réponse
    assert response.status_code == 200

    data = response.json()

    assert "pageData" in data
    assert isinstance(data["pageData"], list)

    for reservation in data["pageData"]:
        assert reservation["user"]["userId"] == TEST_USER_ID

#======================================================================================

# TC051 - Créer une réservation avec une seule place
def test_create_reservation_with_one_seat_tc_051(api_session, base_url, timeout, test_user_headers, reservation_cleanup):
    # ARRANGE : préparer une réservation avec une place disponible
    reservation_payload = {
        "userId": TEST_USER_ID,
        "showId": 13,
        "showSeats": [
            {"seatId": 91}
        ]
    }

    # ACT : envoyer la réservation
    response = api_session.post(f"{base_url}/api/reservations/reserve",json=reservation_payload,headers=test_user_headers,timeout=timeout)

    # ASSERT : vérifier la création
    assert response.status_code == 201, response.text

    data = response.json()

    # Récupérer et enregistrer l'identifiant pour le nettoyage
    reservation_id = data["data"]
    assert isinstance(reservation_id, int)

    reservation_cleanup.append(reservation_id)

#======================================================================================

# TC055 - Créer et vérifier une réservation valide
def test_user_can_create_valid_reservation_tc_055(api_session, base_url, timeout, test_user_headers, reservation_cleanup):
    # ARRANGE : préparer une réservation avec une place disponible
    reservation_payload = {
        "userId": TEST_USER_ID,
        "showId": 13,
        "showSeats": [
            {"seatId": 91}
        ]
    }

    # ACT : créer la réservation
    create_response = api_session.post(f"{base_url}/api/reservations/reserve",json=reservation_payload,headers=test_user_headers,timeout=timeout)

    # ASSERT : vérifier la création
    assert create_response.status_code == 201, create_response.text

    reservation_id = create_response.json()["data"]

    # Enregistrer immédiatement pour le nettoyage automatique
    reservation_cleanup.append(reservation_id)

    # ACT : consulter les réservations de l'utilisateur
    response = api_session.get(f"{base_url}/api/reservations/user/{TEST_USER_ID}/all",headers=test_user_headers,timeout=timeout)

    # ASSERT : vérifier la consultation
    assert response.status_code == 200, response.text

    reservations = response.json()["pageData"]

    # Retrouver la réservation que nous venons de créer
    reservation = next(
        (
            item for item in reservations
            if item["reservationId"] == reservation_id
        ),
        None
    )

    assert reservation is not None
    assert reservation["reservationStatus"] == "BOOKED"
    assert reservation["totalAmount"] > 0

    # Vérifier que la bonne place a été réservée
    assert any(
        seat["showSeatId"] == 91
        for seat in reservation["seatsReserved"]
    )

#======================================================================================

# TC065 - Créer une réservation sans le champ userId
def test_cannot_create_reservation_without_user_id_065(api_session, base_url, timeout, test_user_headers):
    # ARRANGE : préparer une réservation sans userId
    reservation_payload = {
        "showId": 13,
        "showSeats": [
            {"seatId": 91}
        ]
    }

    # ACT : envoyer la réservation
    response = api_session.post(f"{base_url}/api/reservations/reserve",json=reservation_payload,headers=test_user_headers,timeout=timeout)

    # ASSERT : vérifier que la requête est rejetée
    assert response.status_code == 400, response.text


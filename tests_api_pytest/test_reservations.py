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

    # Rechercher la réservation dans toutes les pages
    reservations = response.json()["pageData"]


    reservation = next(
        (
            item for item in reservations
            if item["reservationId"] == reservation_id
        ),
        None
    )

    page = 0

    while reservation is None:
        page += 1

        response = api_session.get(
            f"{base_url}/api/reservations/user/{TEST_USER_ID}/all",
            params={"page": page},
            headers=test_user_headers,
            timeout=timeout
        )

        assert response.status_code == 200, response.text

        reservations = response.json()["pageData"]

        reservation = next(
            (
                item for item in reservations
                if item["reservationId"] == reservation_id
            ),
            None
        )

        # Éviter une boucle infinie
        if not reservations:
            break

    assert reservation is not None, (f"La réservation {reservation_id} est introuvable dans les pages consultées.")
    assert reservation["reservationStatus"] == "BOOKED"
    assert reservation["totalAmount"] > 0

    # Vérifier que la bonne place a été réservée
    assert any(seat["showSeatId"] == 91
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


#======================================================================================
# TC-054 - Vérifier le calcul du montant total pour deux places
def test_reservation_total_amount_two_seats_tc_054(api_session,base_url,timeout,test_user_headers,reservation_cleanup):
    # ARRANGE : réserver deux places de la séance 13
    reservation_payload = {"userId": TEST_USER_ID,"showId": 13,"showSeats": [{"seatId": 91},{"seatId": 92}]}

    # ACT : créer la réservation
    create_response = api_session.post(f"{base_url}/api/reservations/reserve",json=reservation_payload,headers=test_user_headers,timeout=timeout)

    # ASSERT : vérifier la création
    assert create_response.status_code == 201, create_response.text

    reservation_id = create_response.json()["data"]

    # Enregistrer immédiatement pour le nettoyage automatique
    reservation_cleanup.append(reservation_id)

    # ACT : récupérer toutes les pages de réservations
    response = api_session.get(f"{base_url}/api/reservations/user/{TEST_USER_ID}/all", params={"page": 0, "pageSize": 10},headers=test_user_headers,timeout=timeout)

    assert response.status_code == 200, response.text

    first_page = response.json()
    reservations = first_page["pageData"]

    total_pages = first_page["totalPages"]

    for page in range(1, total_pages):
        response = api_session.get(f"{base_url}/api/reservations/user/{TEST_USER_ID}/all",params={"page": page, "pageSize": 10},headers=test_user_headers, timeout=timeout)

        assert response.status_code == 200, response.text
        reservations.extend(response.json()["pageData"])

    # Retrouver la réservation créée
    reservation = next(
        (
            item for item in reservations
            if item["reservationId"] == reservation_id
        ),None
    )

    assert reservation is not None, (f"Réservation {reservation_id} introuvable")

    # Vérifier que deux places ont bien été réservées
    seats = reservation["seatsReserved"]

    assert len(seats) == 2

    # Calculer le montant attendu à partir du prix des deux places
    expected_total = sum(seat["seat"]["seatPrice"]for seat in seats)

    actual_total = reservation["totalAmount"]
    print("\n========== TC-054 ==========")
    print("ID réservation :", reservation_id)
    print("Prix des places :", [seat["seat"]["seatPrice"] for seat in seats])
    print("Montant attendu :", expected_total)
    print("Montant calculé par le backend :", actual_total)
    print("============================")

    # ASSERT : vérifier le calcul du montant total
    assert abs(actual_total - expected_total) < 0.01, (f"Montant incorrect : attendu {expected_total}, "f"obtenu {actual_total}")
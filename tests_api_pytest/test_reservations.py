import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 5

# # TEST 12 - Un utilisateur peut accéder à ses propres réservations 
def test_user_can_access_own_reservations():
    # ARRANGE : connexion avec user8
    payload = {
        "userName": "user8",
        "password": "user8Password"
    }

    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json=payload,
        timeout=TIMEOUT
    )

    assert login_response.status_code == 200

    token = login_response.json()["authenticationToken"]

    # ACT : user8 consulte ses propres réservations
    response = requests.get(
        f"{BASE_URL}/api/reservations/user/5/all",
        headers={"Authorization": f"Bearer {token}"},
        timeout=TIMEOUT
    )

    # ASSERT : vérifier la réponse
    assert response.status_code == 200

    data = response.json()
    assert "pageData" in data
    assert len(data["pageData"]) > 0

    for reservation in data["pageData"]:
        assert reservation["user"]["userId"] == 5

# TEST 13 - Un utilisateur ne peut pas accéder à ses réservations sans être authentifié
def test_cannot_access_reservations_without_token():
    # ARRANGE : aucune authentification

    # ACT : tenter de consulter les réservations de user8
    response = requests.get(
        f"{BASE_URL}/api/reservations/user/5/all",
        timeout=TIMEOUT
    )

    # ASSERT : l'accès doit être refusé
    assert response.status_code == 401

# TEST 14 - Un utulisateur ne peut pas se connecter avec un token invalide
def test_cannot_access_reservations_with_invalid_token():
    # ARRANGE : jeton invalide
    headers = {
        "Authorization": "Bearer invalid_token"
    }

    # ACT : tenter de consulter les réservations
    response = requests.get(
        f"{BASE_URL}/api/reservations/user/5/all",
        headers=headers,
        timeout=TIMEOUT
    )

    # ASSERT : l'accès doit être refusé
    assert response.status_code == 401


# TEST 15 - Création d'une réservation avec des données invalides (champs vides)
def test_cannot_create_reservation_with_empty_seat_list():
    # ARRANGE : connexion avec user8
    payload = {
        "userName": "user8",
        "password": "user8Password"
    }

    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json=payload,
        timeout=TIMEOUT
    )

    assert login_response.status_code == 200

    token = login_response.json()["authenticationToken"]

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # ACT : envoyer une réservation sans siège
    reservation_payload = {
        "userId": 5,
        "showId": 1,
        "showSeats": []
    }

    response = requests.post(
        f"{BASE_URL}/api/reservations/reserve",
        json=reservation_payload,
        headers=headers,
        timeout=TIMEOUT
    )

    # ASSERT : la requête doit être rejetée
    assert response.status_code == 400


# TEST 16 - Créer une réservation sans le champ userId
def test_cannot_create_reservation_without_user_id():
    # ARRANGE : connexion avec user8
    payload = {
        "userName": "user8",
        "password": "user8Password"
    }

    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json=payload,
        timeout=TIMEOUT
    )

    assert login_response.status_code == 200

    token = login_response.json()["authenticationToken"]

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # ACT : envoyer une réservation sans userId
    reservation_payload = {
        "showId": 1,
        "showSeats": [
            {"seatId": 1}
        ]
    }

    response = requests.post(
        f"{BASE_URL}/api/reservations/reserve",
        json=reservation_payload,
        headers=headers,
        timeout=TIMEOUT
    )

    # ASSERT : la requête doit être rejetée
    assert response.status_code == 400


#=======================
# Itération 3
#=======================
# TEST 17 - Créer une réservation valide
# TEST 17 - Vérifier une réservation créée
def test_user_can_create_valid_reservation():
    # ARRANGE : connexion avec user8
    payload = {
        "userName": "user8",
        "password": "user8Password"
    }

    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json=payload,
        timeout=TIMEOUT
    )

    assert login_response.status_code == 200

    token = login_response.json()["authenticationToken"]

    headers = {
        "Authorization": f"Bearer {token}"
    }

    # ACT : consulter les réservations existantes
    response = requests.get(
        f"{BASE_URL}/api/reservations/user/5/all",
        headers=headers,
        timeout=TIMEOUT
    )

    # ASSERT : vérifier la réservation du siège 9
    assert response.status_code == 200

    reservations = response.json()["pageData"]

    reservation = next(
        (
            item for item in reservations
            if any(
                seat["showSeatId"] == 9
                for seat in item["seatsReserved"]
            )
        ),
        None
    )

    assert reservation is not None
    assert reservation["totalAmount"] == 15.0
    assert reservation["reservationStatus"] == "BOOKED"
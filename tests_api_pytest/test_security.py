import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 5


# TEST 10 - Vérifier qu'un utilisateur ne peut pas consulter
# les réservations d'un autre utilisateur.
def test_user_cannot_access_another_users_reservations():
    # ARRANGE : connexion avec user7
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "userName": "user7",
            "password": "user7Password"
        },
        timeout=TIMEOUT
    )

    assert login_response.status_code == 200
    token = login_response.json()["authenticationToken"]

    # ACT : user7 tente de consulter les réservations de user8
    response = requests.get(
        f"{BASE_URL}/api/reservations/user/5/all",
        headers={"Authorization": f"Bearer {token}"},
        timeout=TIMEOUT
    )

    print("Statut HTTP :", response.status_code)
    print("Réponse API :", response.text)

    # ASSERT : l'accès doit être refusé
    assert response.status_code == 403, (
        f"Faille de sécurité : user7 a obtenu le statut "
        f"{response.status_code} en consultant les réservations de user8."
    )


# TEST 11 - Vérifier qu'un utilisateur sans token
# ne peut pas consulter les réservations.
def test_user_without_token_cannot_access_reservations():
    # ACT : consulter les réservations sans être connecté
    response = requests.get(
        f"{BASE_URL}/api/reservations/user/5/all",
        timeout=TIMEOUT
    )

    # ASSERT : l'accès doit être refusé
    assert response.status_code == 401
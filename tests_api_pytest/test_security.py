import pytest
from tests_api_pytest.test_data import TEST_USER_ID
from tests_api_pytest.test_data import TEST_USER_CREDENTIALS
import base64
import json


# TC063 - Vérifier qu'un utilisateur ne peut pas consulter
# les réservations d'un autre utilisateur.
def test_user_cannot_access_another_users_reservations_tc_063(api_session, base_url, timeout, test_user_headers):
    # ARRANGE : connexion avec le compte de test (user ID 11)

    # ACT : l'utilisateur tente de consulter les réservations
    # d'un autre utilisateur (ID 5).
    response = api_session.get(f"{base_url}/api/reservations/user/12/all",headers=test_user_headers,timeout=timeout)

    # ASSERT : l'accès doit être refusé.
    assert response.status_code == 200, (f"Accès non autorisé : statut HTTP {response.status_code}. " f"Réponse API : {response.text}")

# TC063 - ANOMALIE DE SÉCURITÉ
# Un utilisateur peut consulter les réservations d'un autre utilisateur.
# Résultat attendu : 403 Forbidden
# Résultat observé : 200 OK

def get_user_id_from_token(headers):
    """Récupérer le userId contenu dans le JWT."""
    token = headers["Authorization"].split(" ")[1]
    payload = token.split(".")[1]

    payload += "=" * (-len(payload) % 4)

    claims = json.loads(base64.urlsafe_b64decode(payload))

    return claims["userId"]


# ==========================================================
# TC-063 - Empêcher l'accès aux réservations d'un autre user
# ==========================================================

def test_user_cannot_access_another_users_reservations_tc_063(api_session,base_url,timeout,test_user_headers,second_test_user_headers):

    # ARRANGE : récupérer les identifiants des deux utilisateurs
    other_user_id = get_user_id_from_token(second_test_user_headers)

    # ACT : compteTest tente de consulter les réservations
    # de compteTest2
    response = api_session.get(f"{base_url}/api/reservations/user/{other_user_id}/all",headers=test_user_headers,timeout=timeout)

    # ASSERT : accès interdit
    assert response.status_code == 403, response.text



# ==========================================================
# TC-064 - Empêcher une réservation au nom d'un autre user
# ==========================================================

def test_user_cannot_create_reservation_for_another_user_tc_064(api_session,base_url,timeout,test_user_headers,second_test_user_headers):

    # ARRANGE : récupérer le userId du deuxième compte
    other_user_id = get_user_id_from_token(second_test_user_headers)

    reservation_payload = {
        "userId": other_user_id,
        "showId": 13,
        "showSeats": [
            {"seatId": 91}
        ]
    }

    # ACT : compteTest tente de réserver au nom de compteTest2
    response = api_session.post(f"{base_url}/api/reservations/reserve",json=reservation_payload,headers=test_user_headers,timeout=timeout)

    # Si la réservation a été créée, la nettoyer avant de signaler
    # l'anomalie de sécurité.
    if response.status_code == 201:
        reservation_id = response.json()["data"]

        api_session.put(f"{base_url}/api/reservations/cancel/{reservation_id}",headers=second_test_user_headers,timeout=timeout)

    # ASSERT : la création doit être interdite
    assert response.status_code == 403, response.text

import pytest
from tests_api_pytest.test_data import TEST_USER_ID


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
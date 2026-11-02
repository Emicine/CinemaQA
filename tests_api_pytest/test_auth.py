import pytest
from tests_api_pytest.test_data import TEST_USER_CREDENTIALS

#=================================
# Itération 2
#=================================
# TEST - TC012 - Connexion réussie
#Vérifier qu'un utilisateur qui fournit des identifiants valides reçoit une réponse HTTP 200 et un token JWT
def test_login_success_tc_012(api_session, base_url, timeout):
    # Arrange : préparer les identifiants (.copy() pour utiliser une copie des données et pas les réelles)
    payload = TEST_USER_CREDENTIALS.copy()

    # Act : envoyer la requête de connexion
    response = api_session.post(f"{base_url}/auth/login",json=payload,timeout=timeout)

    # Assert : vérifier le résultat
    assert response.status_code == 200

    data = response.json()
    assert data["authenticationToken"]

#=============================================================================================================

# TEST - TC005 - Mot de passe inférieur à 8 caractères
# Vérifier qu'un utilisateur ne peut pas se connecter
# avec un mot de passe inférieur à 8 caractères.

def test_login_password_8_char_tc_005(api_session, base_url, timeout):

    # Arrange : préparer un mot de passe trop court
    payload = TEST_USER_CREDENTIALS.copy()
    payload["password"] = "test123"

    # Act : envoyer la requête de connexion
    response = api_session.post(f"{base_url}/auth/login",json=payload,timeout=timeout)

    # Assert : vérifier que la connexion est refusée
    assert response.status_code == 401

#=============================================================================================================

# TEST - TC013 - Connexion avec des données invalides
# Vérifier que l'API refuse les identifiants incomplets ou incorrects.
# Cas 1 : Pseudo présent, mot de passe absent - HTTP 400
# Cas 2 : Mot de passe présent, pseudo absent - HTTP 400
# Cas 3 : Identifiants incorrects - HTTP 400 ou 401

@pytest.mark.parametrize(
    "payload",
    [
        {"userName": "compteTest"},
        {"password": "mot_de_passe_quelconque"},
        {
            "userName": "utilisateurInexistant",
            "password": "mauvaisMotDePasse"
        }
    ]
)
def test_login_wrong_data_tc_013(api_session, base_url, timeout, payload):

    # Act : envoyer la requête avec des données invalides
    response = api_session.post(f"{base_url}/auth/login",json=payload,timeout=timeout)

    # Assert : vérifier que la connexion est refusée
    assert response.status_code in [400, 401]

# 400 : requête invalide, par exemple un champ obligatoire manquant.
# 401 : authentification refusée, par exemple un utilisateur inconnu.

#=============================================================================================================

# TEST - TC014 - Vérifier la présence du token JWT
# Vérifier que la réponse contient un token JWT valide au format chaîne.

def test_login_response_contains_authentication_token_tc_014(api_session, base_url, timeout):

    # Arrange
    payload = TEST_USER_CREDENTIALS.copy()

    # Act
    response = api_session.post(f"{base_url}/auth/login",json=payload,timeout=timeout)

    # Assert
    assert response.status_code == 200

    data = response.json()

    assert "authenticationToken" in data
    assert isinstance(data["authenticationToken"], str)
    assert data["authenticationToken"] != ""

# in data : la propriété existe
# isinstance(..., str) : sa valeur est une chaîne de caractères
# != "" : la chaîne n'est pas vide

#=============================================================================================================

# TEST - TC016 - Refuser un JWT invalide
# Vérifier qu'un utilisateur ne peut pas accéder
# à une route protégée avec un JWT invalide.

def test_login_wrong_jwt_tc_016(api_session, base_url, timeout):

    # Arrange : préparer un faux JWT
    headers = {
        "Authorization": "Bearer faux.jwt.invalide"
    }

    # Act : accéder à une route protégée
    response = api_session.get(f"{base_url}/api/reservations/user/1/all",headers=headers,timeout=timeout)

    # Assert : vérifier que l'accès est refusé
    assert response.status_code == 401

#=============================================================================================================
#=============================================================================================================


# TEST - Vérifier la connexion administrateur
def test_admin_login(api_session, base_url, timeout):
    from tests_api_pytest.test_data import ADMIN_CREDENTIALS

    response = api_session.post(
        f"{base_url}/auth/login",
        json=ADMIN_CREDENTIALS,
        timeout=timeout
    )

    assert response.status_code == 200, response.text

    data = response.json()
    assert "authenticationToken" in data
    assert data["authenticationToken"] != ""

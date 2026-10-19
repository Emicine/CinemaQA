import requests
import pytest

BASE_URL = "http://localhost:8080"
TIMEOUT = 5

#=================================
# Itération 2
#=================================
# TEST 1 - Connexion réussie
#Vérifier qu'un utilisateur qui fournit des identifiants valides reçoit une réponse HTTP 200 et un token JWT
def test_login_success():
    # Arrange : préparer les identifiants
    payload = {
        "userName": "superAdmin",
        "password": "superPassword@123"
    }

    # Act : envoyer la requête de connexion
    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=TIMEOUT )

    # Assert : vérifier le résultat
    assert response.status_code == 200

    data = response.json()
    assert data["authenticationToken"] is not None
    assert data["authenticationToken"] != ""


# TEST 2 - Connexion avec de faux identifiants
def test_login_wrong_password():
    payload = {
        "userName": "superAdmin",
        "password": "FauxMotDePasse"
    }

    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=TIMEOUT )

    assert response.status_code == 401

# TEST 3 - Connexion avec mot de passe manquant
def test_login_missing_password():
    payload = {
        "userName": "superAdmin",
    }

    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=TIMEOUT )

    assert response.status_code == 400

# TEST 4 - Connexion avec pseudo manquant
def test_login_missing_pseudo():
    payload = {
        "password": "superPassword@123"
    }

    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=TIMEOUT )

    assert response.status_code == 400

# TEST 5 - Vérifier si la réponse contient un token JWT
def test_login_response_contains_authentication_token():
    # Arrange
    payload = {
        "userName": "superAdmin",
        "password": "superPassword@123"
    }

    # Act
    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=TIMEOUT )

    # Assert
    assert response.status_code == 200

    data = response.json()
    assert "authenticationToken" in data
    assert isinstance(data["authenticationToken"], str)
    assert data["authenticationToken"] != ""

# TEST 6 - Parametrize avec pseudo présent et mot de passe manquants
@pytest.mark.parametrize(
    "payload",
    [
        {"userName": "superAdmin"},
        {"password": "mot_de_passe_quelconque"}
    ]
)
def test_login_missing_required_field(payload):
    # Act : envoyer la requête de connexion
    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=TIMEOUT)

    # Assert : vérifier que la requête est refusée
    assert response.status_code == 400


# TEST 7 - Tester un utilisateur qui n'existe pas
def test_login_unknown_user():
    # Arrange : utiliser un nom d'utilisateur inexistant
    payload = {
        "userName": "utilisateur_inexistant_98765",
        "password": "mot_de_passe_quelconque"
    }

    # Act : envoyer la requête de connexion
    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=TIMEOUT)

    # Assert : vérifier que la connexion est refusée
    assert response.status_code == 401


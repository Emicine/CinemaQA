import os
import pytest
import requests
from tests_api_pytest.test_data import TEST_USER_CREDENTIALS
from tests_api_pytest.test_data import ADMIN_CREDENTIALS
from tests_api_pytest.test_data import SECOND_TEST_USER_CREDENTIALS

# # os = Lire une variable d'environnement.
# # os.getenv(...) utilise http://localhost:8080 par défaut, mais permet de changer d'adresse sans modifier le code.
# # .rstrip("/") retire un éventuel / à la fin de l'adresse, pour éviter de construire une URL avec //.

# #Adresse de base de l'API CinemaQA
# BASE_URL = "http://localhost:8080"

# @pytest.fixture
# def api_session():
#     # Création d'une session HTTP pour envoyer des requêtes
#     session = requests.Session()


@pytest.fixture(scope="session")
def base_url():
    return os.getenv("API_URL","http://localhost:8080").rstrip("/")


@pytest.fixture(scope="session")
def timeout():
    return 5


@pytest.fixture
def api_session():
    with requests.Session() as session:
        yield session


@pytest.fixture
def test_user_headers(api_session, base_url, timeout):

    # ARRANGE : préparer les identifiants
    payload = TEST_USER_CREDENTIALS.copy()

    # ACT : se connecter
    response = api_session.post(f"{base_url}/auth/login",json=payload,timeout=timeout)

    # ASSERT : vérifier la connexion
    assert response.status_code == 200

    token = response.json()["authenticationToken"]

    # Retourner les headers contenant le JWT
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def reservation_cleanup(api_session, base_url, timeout, test_user_headers):
    reservation_ids = []

    yield reservation_ids

    for reservation_id in reservation_ids:
        response = api_session.put(f"{base_url}/api/reservations/cancel/{reservation_id}",headers=test_user_headers,timeout=timeout)
        assert response.status_code == 200


@pytest.fixture
def admin_headers(api_session, base_url, timeout):

    payload = ADMIN_CREDENTIALS.copy()

    response = api_session.post(f"{base_url}/auth/login",json=payload,timeout=timeout)

    assert response.status_code == 200, response.text

    token = response.json()["authenticationToken"]

    return {"Authorization": f"Bearer {token}"}



@pytest.fixture
def movie_cleanup(api_session, base_url, timeout, admin_headers):
    movie_ids = []

    yield movie_ids

    for movie_id in movie_ids:
        response = api_session.delete(f"{base_url}/api/movies/movie/{movie_id}",headers=admin_headers,timeout=timeout)
        assert response.status_code == 200, response.text


@pytest.fixture
def theatre_cleanup(api_session, base_url, timeout, admin_headers):
    theatre_ids = []

    yield theatre_ids

    for theatre_id in theatre_ids:
        response = api_session.delete(f"{base_url}/api/theatres/theatre/{theatre_id}",headers=admin_headers,timeout=timeout)
        assert response.status_code == 200, response.text


@pytest.fixture
def second_test_user_headers(api_session, base_url, timeout):

    # Connexion avec le deuxième compte
    response = api_session.post(f"{base_url}/auth/login",json=SECOND_TEST_USER_CREDENTIALS,timeout=timeout)

    assert response.status_code == 200, response.text

    token = response.json()["authenticationToken"]

    return {"Authorization": f"Bearer {token}"}

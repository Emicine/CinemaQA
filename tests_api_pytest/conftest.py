import os
import pytest

# # os = Lire une variable d'environnement.
# # os.getenv(...) utilise http://localhost:8080 par défaut, mais permet de changer d'adresse sans modifier le code.
# # .rstrip("/") retire un éventuel / à la fin de l'adresse, pour éviter de construire une URL avec //.

# # @pytest.fixture(scope="session")
# # def base_url():
# #     return os.getenv("API_URL", "http://localhost:8080").rstrip("/")

# #Adresse de base de notre API CinemaQA
# BASE_URL = "http://localhost:8080"

# @pytest.fixture
# def api_session():
#     # Création d'une session HTTP pour envoyer des requêtes
#     session = requests.Session()



# adresse de base de l'API à tous les tests

@pytest.fixture(scope="session")
def base_url():
    # Utilise API_URL si elle est définie,
    # sinon utilise l'adresse locale de CinemaQA
    return os.getenv("API_URL", "http://localhost:8080").rstrip("/")
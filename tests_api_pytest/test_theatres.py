import requests

# URL de base de l'API CinemaQA
BASE_URL = "http://localhost:8080"

#Temps d'attente maximal pour une requête
TIMEOUT = 5

#==========================================================
# Itération 1 - Disponibilité de l'API et accès aux données
#==========================================================

#A VERIFIER
# TEST 1 - Vérifier qu'il existe au moins 1 cinéma
def test_get_theatres_returns_200():
    response = requests.get(f"{BASE_URL}/api/theatres/all", timeout=TIMEOUT)

    # Vérification du code status
    assert response.status_code == 200

    # Récupération du contenu JSON
    data = response.json()
    assert len(data["pageData"]) > 0


# TEST 2 - Vérifier que le cinéma possède un nom
def test_get_theatres_names_returns_200():
    response = requests.get(f"{BASE_URL}/api/theatres/all", timeout=TIMEOUT)

    assert response.status_code == 200

    data = response.json()

    # Vérifier que chaque cinéma possède un nom
    for theatre in data["pageData"]:
        assert theatre["theatreName"] is not None


# TEST 3 - Vérifier que chaque nom de cinéma n'est pas vide
def test_get_theatres_names_not_none_returns_200():
    response = requests.get(f"{BASE_URL}/api/theatres/all", timeout=TIMEOUT)

    assert response.status_code == 200

    data = response.json()

    # Vérifier que chaque nom n'est pas vide
    for theatre in data["pageData"]:
        assert theatre["theatreName"] != ""



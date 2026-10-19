import requests
import json
from jsonschema import validate

# URL de base de l'API CinemaQA
BASE_URL = "http://localhost:8080"

#Temps d'attente maximal pour une requête
TIMEOUT = 5

#==========================================================
# Itération 1 - Disponibilité de l'API et accès aux données
#==========================================================

# TEST 1 - Récupérer tous les films 
def test_get_movies_returns_200():
# Envoi de la requête à l'API
    response = requests.get(f"{BASE_URL}/api/movies/all", timeout=TIMEOUT)

    # Vérification du code status
    assert response.status_code == 200

    # Récupération du contenu JSON
    data = response.json()
    assert len(data["pageData"]) > 0


# TEST 2 - Vérifier que les films ont tous un titre 
def test_get_movies_titles_returns_200():
    response = requests.get(f"{BASE_URL}/api/movies/all", timeout=TIMEOUT)

    #Debug
    # data = response.json()
    # print(data["pageData"][0])

    assert response.status_code == 200

    data = response.json()
    assert len(data["pageData"]) > 0
    #Pour chaque film dans pageData, on vérifie que le champ "title" n'est pas "none"
    for movie in data["pageData"]: 
        assert movie["movieName"] is not None

# TEST 3 - Vérifier que le titre des films n'est pas vide
def test_get_movies_titles_non_vide_returns_200():
    response = requests.get(f"{BASE_URL}/api/movies/all", timeout=TIMEOUT)

    assert response.status_code == 200

    data = response.json()
    assert len(data["pageData"]) > 0

    for movie in data["pageData"]:
        assert movie["movieName"] != ""

# TEST 4 - Vérifier que les films ont un ID
def test_get_movies_have_id():
    response = requests.get(f"{BASE_URL}/api/movies/all", timeout=TIMEOUT)

    # Act : récupérer les données
    assert response.status_code == 200
    data = response.json()

    # Assert : vérifier que chaque film possède un identifiant
    assert len(data["pageData"]) > 0

    for movie in data["pageData"]:
        assert movie["movieId"] is not None

# TEST 5 - Vérifier que les films ont un ID unique
def test_get_movies_ids_are_unique():
    response = requests.get(f"{BASE_URL}/api/movies/all", timeout=TIMEOUT)

    # Act : récupérer les films
    assert response.status_code == 200
    data = response.json()
    movies = data["pageData"]

    # Récupérer tous les identifiants
    movie_ids = []

    for movie in movies:
        movie_ids.append(movie["movieId"])

    # Vérifier que tous les identifiants sont uniques
    assert len(movie_ids) == len(set(movie_ids))

# TEST 8 - Le schéma doit correspondre au schéma de réponse des films
def test_get_movies_matches_json_schema():
    # Arrange : charger le schéma JSON
    with open("tests_api_pytest/schemas/movies.schema.json", encoding="utf-8") as schema_file:
        schema = json.load(schema_file)

    # Act : appeler l'API
    response = requests.get(f"{BASE_URL}/api/movies/all", timeout=TIMEOUT )

    assert response.status_code == 200
    data = response.json()

    # Assert : vérifier la conformité au schéma
    validate(instance=data, schema=schema)
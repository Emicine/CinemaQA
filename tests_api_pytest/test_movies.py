import json
from jsonschema import validate

# ==========================================================
# Itération 1 - Disponibilité de l'API et accès aux données
# ==========================================================

# TC027 - Récupérer tous les films
def test_get_movies_returns_200_tc_027(api_session, base_url, timeout):

    # ACT : envoyer la requête à l'API
    response = api_session.get(f"{base_url}/api/movies/all",timeout=timeout)

    # ASSERT : vérifier la réponse
    assert response.status_code == 200

    data = response.json()
    assert len(data["pageData"]) > 0

# ==========================================================

# TC066 - Vérifier que tous les films ont un titre
def test_get_movies_titles_returns_200_tc_66(api_session, base_url, timeout):

    # ACT : récupérer les films
    response = api_session.get(f"{base_url}/api/movies/all",timeout=timeout)

    # ASSERT : vérifier les titres
    assert response.status_code == 200

    data = response.json()
    assert len(data["pageData"]) > 0

    for movie in data["pageData"]:
        assert movie["movieName"] is not None

# ==========================================================

# TC067 - Vérifier que les films ont un identifiant
def test_get_movies_have_id_tc_067(api_session, base_url, timeout):

    # ACT : récupérer les films
    response = api_session.get(f"{base_url}/api/movies/all",timeout=timeout)

    # ASSERT : vérifier les identifiants
    assert response.status_code == 200

    data = response.json()
    assert len(data["pageData"]) > 0

    for movie in data["pageData"]:
        assert movie["movieId"] is not None

# ==========================================================

# TC068 - Vérifier la conformité au schéma JSON des films
def test_get_movies_matches_json_schema_tc_068(api_session, base_url, timeout):

    # ARRANGE : charger le schéma JSON
    with open("tests_api_pytest/schemas/movies.schema.json",encoding="utf-8") as schema_file:
        schema = json.load(schema_file)

    # ACT : récupérer les films
    response = api_session.get(f"{base_url}/api/movies/all",timeout=timeout)

    # ASSERT : vérifier la réponse et le schéma
    assert response.status_code == 200

    data = response.json()
    validate(instance=data, schema=schema)

# ==========================================================

# TC028 - Consulter le détail d'un film
def test_get_movie_details_tc_028(api_session, base_url, timeout):

    # ARRANGE : récupérer un film existant
    movies_response = api_session.get(f"{base_url}/api/movies/all",timeout=timeout)

    assert movies_response.status_code == 200

    movies = movies_response.json()["pageData"]
    assert len(movies) > 0

    movie_id = movies[0]["movieId"]

    # ACT : consulter le détail du film
    response = api_session.get(f"{base_url}/api/movies/movie/{movie_id}",timeout=timeout)

    # ASSERT : vérifier les informations du film
    assert response.status_code == 200

    movie = response.json()["data"]

    assert movie["movieId"] == movie_id
    assert movie["movieName"] is not None
    assert movie["movieName"] != ""

# ==========================================================


# TC017 - Créer un film avec des données valides
def test_create_movie_with_valid_data_tc_017(api_session, base_url, timeout, admin_headers, movie_cleanup):

    # ARRANGE : préparer les données du film
    movie_payload = {
        "movieName": "Film test automatise TC017",
        "movieGenre": "ACTION",
        "movieDirector": "Realisateur Test",
        "movieReleaseDate": "2026-01-15",
        "movieDescription": "Film cree pour les tests automatises",
        "movieDuration": 120,
        "moviePosterUrl": ""
    }

    # ACT : créer le film
    response = api_session.post(f"{base_url}/api/movies/movie/create",json=movie_payload,headers=admin_headers,timeout=timeout)

    # ASSERT : vérifier la création
    assert response.status_code == 201, response.text

    data = response.json()["data"]

    # Récupérer l'identifiant pour le nettoyage
    movie_id = data["movieId"]
    movie_cleanup.append(movie_id)

    # Vérifier les informations du film créé
    assert data["movieName"] == movie_payload["movieName"]
    assert data["movieGenre"] == movie_payload["movieGenre"]
    assert data["movieDuration"] == 120

# ==========================================================

# TC025 - Créer un film avec une durée de 1 minute
def test_create_movie_with_one_minute_duration_tc_025(api_session, base_url, timeout, admin_headers, movie_cleanup):

    # ARRANGE : préparer les données du film
    movie_payload = {
        "movieName": "Film test duree 1 minute TC025",
        "movieGenre": "COMEDY",
        "movieDirector": "Realisateur Test",
        "movieReleaseDate": "2026-01-15",
        "movieDescription": "Film de test avec une duree minimale",
        "movieDuration": 1,
        "moviePosterUrl": ""
    }

    # ACT : créer le film
    response = api_session.post(f"{base_url}/api/movies/movie/create",json=movie_payload,headers=admin_headers,timeout=timeout)

    # ASSERT : vérifier la création
    assert response.status_code == 201, response.text

    data = response.json()["data"]

    # Enregistrer le film pour le nettoyage automatique
    movie_id = data["movieId"]
    movie_cleanup.append(movie_id)

    # Vérifier que la durée est bien de 1 minute
    assert data["movieDuration"] == 1


# ==========================================================
# TC-020 - Créer un film sans renseigner le genre
# ==========================================================

def test_create_movie_without_genre_tc_020(api_session, base_url, timeout, admin_headers):

    # ARRANGE : préparer un film sans genre
    movie_payload = {
        "movieName": "Film test TC020",
        "movieDirector": "Realisateur Test",
        "movieReleaseDate": "2026-01-15",
        "movieDescription": "Film sans genre",
        "movieDuration": 120,
        "moviePosterUrl": ""
    }

    # ACT : envoyer la requête
    response = api_session.post(f"{base_url}/api/movies/movie/create",json=movie_payload,headers=admin_headers,timeout=timeout)

    # ASSERT : le genre est obligatoire
    assert response.status_code == 400, response.text

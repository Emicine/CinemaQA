import requests

# URL de base de l'API CinemaQA
BASE_URL = "http://localhost:8080"

#Temps d'attente maximal pour une requête
TIMEOUT = 5

#==========================================================
# Itération 1 - Disponibilité de l'API et accès aux données
#==========================================================
# TC038 - Vérifier qu'il existe au moins un cinéma.
def test_get_theatres_returns_200_tc_038(api_session, base_url, timeout):
    response = api_session.get(f"{base_url}/api/theatres/all",timeout=timeout)

    assert response.status_code == 200

    data = response.json()
    assert len(data["pageData"]) > 0

#==================================================================

# TC029 - Créer un cinéma avec des informations valides.
def test_create_theatre_with_valid_data_tc_029(api_session, base_url, timeout, admin_headers, theatre_cleanup):
    theatre_payload = {
        "theatreName": "Cinema Test Automatise TC029",
        "theatreLocation": "Paris",
        "theatreAdminId": 2,
        "screens": [
            {
                "screenName": "Salle Test TC029",
                "seats": [
                    {
                        "rowId": 1,
                        "seatNumber": 1,
                        "seatType": "SINGLE",
                        "seatPrice": 10.0
                    }
                ]
            }
        ]
    }

    response = api_session.post(f"{base_url}/api/theatres/theatre/create",json=theatre_payload,headers=admin_headers,timeout=timeout)

    assert response.status_code == 201, response.text

    data = response.json()["data"]
    theatre_id = data["theatreId"]
    theatre_cleanup.append(theatre_id)

    assert data["theatreName"] == theatre_payload["theatreName"]
    assert data["theatreLocation"] == theatre_payload["theatreLocation"]
    assert data["theatreId"] is not None

#==================================================================

# TC031 - Créer un cinéma sans localisation.
def test_create_theatre_without_location_tc_031(api_session, base_url, timeout, admin_headers):
    theatre_payload = {
        "theatreName": "Cinema Test Sans Localisation TC031",
        "theatreAdminId": 2,
        "screens": [
            {
                "screenName": "Salle Test TC031",
                "seats": [
                    {
                        "rowId": 1,
                        "seatNumber": 1,
                        "seatType": "SINGLE",
                        "seatPrice": 10.0
                    }
                ]
            }
        ]
    }

    response = api_session.post(f"{base_url}/api/theatres/theatre/create",json=theatre_payload,headers=admin_headers,timeout=timeout)

    assert response.status_code == 400, response.text

#==================================================================


# TC-030 - Vérifier que chaque nom de cinéma n'est pas vide
def test_get_theatres_names_not_none_returns_200_tc_030():
    response = requests.get(f"{BASE_URL}/api/theatres/all", timeout=TIMEOUT)

    assert response.status_code == 200

    data = response.json()

    # Vérifier que chaque nom n'est pas vide
    for theatre in data["pageData"]:
        assert theatre["theatreName"] != ""



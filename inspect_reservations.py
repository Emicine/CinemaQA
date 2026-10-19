import requests

BASE_URL = "http://localhost:8080"
TIMEOUT = 5

# 1. Se connecter avec user8
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={
        "userName": "user8",
        "password": "user8Password"
    },
    timeout=TIMEOUT
)

print("Connexion :", login_response.status_code)

token = login_response.json()["authenticationToken"]

headers = {
    "Authorization": f"Bearer {token}"
}

# 2. Lire les réservations existantes (GET uniquement)
response = requests.get(
    f"{BASE_URL}/api/reservations/user/5/all",
    headers=headers,
    timeout=TIMEOUT
)

print("Réservations :", response.status_code)
print("Réponse JSON :", response.json())

# 3. Vérifier l'état actuel des sièges du spectacle
show_response = requests.get(
    f"{BASE_URL}/api/shows/show/1",
    timeout=TIMEOUT
)

show_data = show_response.json()["data"]

print("État des sièges : " )
for seat in show_data["showSeats"]:
    print(seat["showSeatId"], seat["seatStatus"])
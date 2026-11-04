import os
from dotenv import load_dotenv

load_dotenv()

# Compte dédié aux tests automatisés
TEST_USER_CREDENTIALS = {
    "userName": "compteTest",
    "password": "testPassword@123"
}

# Identifiant du compte dans PostgreSQL
TEST_USER_ID = 11


# Compte administrateur dédié aux tests
ADMIN_CREDENTIALS = {
    "userName": os.getenv("ADMIN_USERNAME"),
    "password": os.getenv("ADMIN_PASSWORD")
}

SECOND_TEST_USER_CREDENTIALS = {
    "userName": "compteTest2",
    "password": "test2Password@123"
}
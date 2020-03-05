
print('Creating collection Authentication');
db.createCollection('authentication');
db.authentication.insert({
    "id": "900978d3-c8e1-4d8c-9c1b-3a89a47e45e1",
    "type": "Login",
    "login": {
        "login": "admin",
        "hash": "UxIDTgbpYJvEDWeZRZqktTjeptr40nfnMoD4deJhw/6kgQ/YZ81PqNQi4iPuTylp+Kvc1/jaGoT9b/cR8sKmEg==$OcEyeV7Cb7/pNQROtHg9bDICJPdw7w3JP3lYiaJuZMM=",
        "passwordType": "PBKDF2WithHmacSHA512"
    }
});
print('Collection Authentication created');
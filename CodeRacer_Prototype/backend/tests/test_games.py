"""
Integration tests for multiplayer game endpoints in routes/games.py
"""
from fastapi import status
from backend.models import Language, Snippet, GameParticipant


def signup_user(client, username: str, email: str, password: str = "testpass123") -> int:
    resp = client.post(
        "/auth/signup",
        json={"username": username, "email": email, "password": password},
    )
    assert resp.status_code == status.HTTP_200_OK, resp.text
    return resp.json()["id"]


def seed_snippet(db_session) -> Snippet:
    lang = Language(name="python")
    db_session.add(lang)
    db_session.commit()
    snip = Snippet(code="print('hi')", language_id=lang.id)
    db_session.add(snip)
    db_session.commit()
    return snip


def test_create_game_requires_existing_user(client, db_session):
    # No such user in DB
    seed_snippet(db_session)
    payload = {"user_id": 999999, "max_players": 4}
    resp = client.post("/games/create", json=payload)
    assert resp.status_code == status.HTTP_404_NOT_FOUND
    assert "User not found" in resp.json()["detail"]


def test_create_game_success_random_snippet(client, db_session):
    # Arrange: user + at least one snippet in DB
    user_id = signup_user(client, "host1", "host1@example.com")
    seed_snippet(db_session)

    # Act
    resp = client.post(
        "/games/create",
        json={"user_id": user_id, "max_players": 4},
    )

    # Assert
    assert resp.status_code == status.HTTP_200_OK, resp.text
    game = resp.json()
    assert game["host_user_id"] == user_id
    assert game["status"] == "waiting"
    assert isinstance(game["room_code"], str) and len(game["room_code"]) == 6

    # Host should be auto-added as participant
    participants = db_session.query(GameParticipant).filter(GameParticipant.game_id == game["id"]).all()
    assert len(participants) == 1
    assert participants[0].user_id == user_id


def test_join_game_success(client, db_session):
    # Arrange
    host_id = signup_user(client, "host2", "host2@example.com")
    joiner_id = signup_user(client, "joiner", "joiner@example.com")
    seed_snippet(db_session)

    create_resp = client.post(
        "/games/create",
        json={"user_id": host_id, "max_players": 4},
    )
    assert create_resp.status_code == status.HTTP_200_OK
    room_code = create_resp.json()["room_code"]

    # Act
    resp = client.post(
        "/games/join",
        json={"user_id": joiner_id, "room_code": room_code},
    )

    # Assert
    assert resp.status_code == status.HTTP_200_OK, resp.text
    game_id = create_resp.json()["id"]
    participants = db_session.query(GameParticipant).filter(GameParticipant.game_id == game_id).all()
    assert len(participants) == 2  # host + joiner


def test_join_game_full(client, db_session):
    # Arrange: create a game with max_players=1 (already has host)
    host_id = signup_user(client, "host3", "host3@example.com")
    other_id = signup_user(client, "other", "other@example.com")
    seed_snippet(db_session)

    create_resp = client.post(
        "/games/create",
        json={"user_id": host_id, "max_players": 1},
    )
    assert create_resp.status_code == status.HTTP_200_OK
    room_code = create_resp.json()["room_code"]

    # Act: another player tries to join
    resp = client.post(
        "/games/join",
        json={"user_id": other_id, "room_code": room_code},
    )

    # Assert
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
    assert "full" in resp.json()["detail"].lower()


def test_get_game_details(client, db_session):
    # Arrange
    host_id = signup_user(client, "host4", "host4@example.com")
    snip = seed_snippet(db_session)

    create_resp = client.post(
        "/games/create",
        json={"user_id": host_id, "snippet_id": snip.id, "max_players": 4},
    )
    assert create_resp.status_code == status.HTTP_200_OK
    room_code = create_resp.json()["room_code"]

    # Act
    resp = client.get(f"/games/{room_code}")

    # Assert
    assert resp.status_code == status.HTTP_200_OK, resp.text
    data = resp.json()
    assert "game" in data and "participants" in data and "snippet_code" in data
    assert data["game"]["room_code"] == room_code
    assert isinstance(data["participants"], list)
    assert data["snippet_code"] == "print('hi')"


def test_start_game_transitions_to_in_progress(client, db_session):
    """Start endpoint now only changes status if waiting (no host check)."""
    host_id = signup_user(client, "host5", "host5@example.com")
    seed_snippet(db_session)

    create_resp = client.post(
        "/games/create",
        json={"user_id": host_id, "max_players": 4},
    )
    assert create_resp.status_code == status.HTTP_200_OK
    room_code = create_resp.json()["room_code"]

    resp_start = client.post(f"/games/{room_code}/start")
    assert resp_start.status_code == status.HTTP_200_OK
    # Fetch details to verify change
    details = client.get(f"/games/{room_code}").json()
    assert details["game"]["status"] == "in_progress"

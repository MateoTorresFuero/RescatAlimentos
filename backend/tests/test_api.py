from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.dependencies import get_current_actor
from app.db.models import UserRole


def create_lot(client: TestClient) -> str:
    response = client.post(
        "/api/v1/lotes",
        json={
            "category": "Frescos",
            "description": "Verduras de estación",
            "weight_kg": "12.50",
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=12)).isoformat(),
            "requires_cold_chain": False,
            "pickup_address": "Mercado Central, Lima",
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_lot_creation_listing_and_detail(client: TestClient, use_actor) -> None:
    use_actor(UserRole.DONANTE)
    lot_id = create_lot(client)

    use_actor(UserRole.COMEDOR)
    listing = client.get("/api/v1/lotes")
    detail = client.get(f"/api/v1/lotes/{lot_id}")

    assert listing.status_code == 200
    assert listing.json()[0]["id"] == lot_id
    assert detail.status_code == 200
    assert detail.json()["status"] == "DISPONIBLE"


def test_reservation_and_transport_are_created_together(
    client: TestClient, use_actor
) -> None:
    use_actor(UserRole.DONANTE)
    lot_id = create_lot(client)
    comedor_id = use_actor(UserRole.COMEDOR)

    response = client.post(
        f"/api/v1/lotes/{lot_id}/reservas",
        json={
            "request_transport": True,
            "delivery_address": "Comedor de prueba, Lima",
        },
    )

    assert response.status_code == 201
    assert response.json()["comedor_id"] == str(comedor_id)
    assert response.json()["transport_request_id"]

    use_actor(UserRole.DRIVER)
    requests = client.get("/api/v1/transporte/solicitudes")
    assert requests.status_code == 200
    assert len(requests.json()) == 1
    assert requests.json()[0]["pickup_address"] == "Mercado Central, Lima"
    assert requests.json()[0]["delivery_address"] == "Comedor de prueba, Lima"


def test_lot_cannot_be_reserved_twice(client: TestClient, use_actor) -> None:
    use_actor(UserRole.DONANTE)
    lot_id = create_lot(client)
    use_actor(UserRole.COMEDOR)
    payload = {"request_transport": False}

    first = client.post(f"/api/v1/lotes/{lot_id}/reservas", json=payload)
    second = client.post(f"/api/v1/lotes/{lot_id}/reservas", json=payload)

    assert first.status_code == 201
    assert second.status_code == 409


def test_available_lot_listing_hides_reserved_lots(
    client: TestClient, use_actor
) -> None:
    use_actor(UserRole.DONANTE)
    lot_id = create_lot(client)
    use_actor(UserRole.COMEDOR)
    client.post(
        f"/api/v1/lotes/{lot_id}/reservas",
        json={"request_transport": False},
    )

    available = client.get("/api/v1/lotes")
    reserved = client.get("/api/v1/lotes?estado=RESERVADO")

    assert available.status_code == 200
    assert available.json() == []
    assert reserved.status_code == 200
    assert reserved.json()[0]["status"] == "RESERVADO"


def test_transport_request_can_be_assigned_only_once(
    client: TestClient, use_actor
) -> None:
    use_actor(UserRole.DONANTE)
    lot_id = create_lot(client)
    use_actor(UserRole.COMEDOR)
    reservation = client.post(
        f"/api/v1/lotes/{lot_id}/reservas",
        json={
            "request_transport": True,
            "delivery_address": "Comedor de prueba, Lima",
        },
    ).json()
    request_id = reservation["transport_request_id"]

    use_actor(UserRole.DRIVER)
    first = client.post(
        f"/api/v1/transporte/solicitudes/{request_id}/aceptacion"
    )
    second = client.post(
        f"/api/v1/transporte/solicitudes/{request_id}/aceptacion"
    )

    assert first.status_code == 200
    assert first.json()["status"] == "ASIGNADA"
    assert first.json()["driver_id"] == str(client.user_ids[UserRole.DRIVER])
    assert second.status_code == 409


def test_roles_are_enforced(client: TestClient, use_actor) -> None:
    use_actor(UserRole.COMEDOR)
    response = client.post(
        "/api/v1/lotes",
        json={
            "category": "Frescos",
            "description": "Verduras",
            "weight_kg": "1",
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=12)).isoformat(),
            "pickup_address": "Mercado Central, Lima",
        },
    )

    assert response.status_code == 403


def test_transport_requires_delivery_address(client: TestClient, use_actor) -> None:
    use_actor(UserRole.DONANTE)
    lot_id = create_lot(client)
    use_actor(UserRole.COMEDOR)

    response = client.post(
        f"/api/v1/lotes/{lot_id}/reservas",
        json={"request_transport": True},
    )

    assert response.status_code == 422


def test_missing_lot_returns_not_found(client: TestClient, use_actor) -> None:
    use_actor(UserRole.COMEDOR)
    response = client.get(f"/api/v1/lotes/{uuid4()}")

    assert response.status_code == 404


def test_missing_actor_is_rejected(client: TestClient) -> None:
    client.app.dependency_overrides.pop(get_current_actor)

    response = client.get("/api/v1/lotes")

    assert response.status_code == 401

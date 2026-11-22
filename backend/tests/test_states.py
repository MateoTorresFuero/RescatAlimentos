from datetime import datetime, timezone
from uuid import uuid4

import pytest

from app.db.models import LotStatus, TransportStatus
from app.domain.errors import InvalidTransitionError
from app.domain.states import LotLifecycle, TransportLifecycle


def test_lot_state_allows_only_available_to_reserved() -> None:
    lifecycle = LotLifecycle.from_status(LotStatus.DISPONIBLE)
    lifecycle.reserve()

    assert lifecycle.status is LotStatus.RESERVADO
    with pytest.raises(InvalidTransitionError):
        lifecycle.reserve()


def test_transport_state_requires_driver_when_assigned() -> None:
    with pytest.raises(InvalidTransitionError):
        TransportLifecycle.from_values(TransportStatus.ASIGNADA, None, None)

    lifecycle = TransportLifecycle.from_values(
        TransportStatus.DISPONIBLE,
        None,
        None,
    )
    driver_id = uuid4()
    lifecycle.assign(driver_id)

    assert lifecycle.status is TransportStatus.ASIGNADA
    assert lifecycle.driver_id == driver_id
    assert lifecycle.assigned_at is not None
    with pytest.raises(InvalidTransitionError):
        lifecycle.assign(uuid4())

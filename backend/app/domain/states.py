from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Protocol
from uuid import UUID

from app.db.models import LotStatus, TransportStatus
from app.domain.errors import InvalidTransitionError


class LotState(Protocol):
    @property
    def status(self) -> LotStatus: ...

    def reserve(self) -> LotState: ...


@dataclass(frozen=True)
class AvailableLotState:
    @property
    def status(self) -> LotStatus:
        return LotStatus.DISPONIBLE

    def reserve(self) -> LotState:
        return ReservedLotState()


@dataclass(frozen=True)
class ReservedLotState:
    @property
    def status(self) -> LotStatus:
        return LotStatus.RESERVADO

    def reserve(self) -> LotState:
        raise InvalidTransitionError("El lote ya fue reservado.")


def lot_state_for(status: LotStatus) -> LotState:
    states: dict[LotStatus, LotState] = {
        LotStatus.DISPONIBLE: AvailableLotState(),
        LotStatus.RESERVADO: ReservedLotState(),
    }
    return states[status]


@dataclass
class LotLifecycle:
    state: LotState

    @classmethod
    def from_status(cls, status: LotStatus) -> LotLifecycle:
        return cls(lot_state_for(status))

    @property
    def status(self) -> LotStatus:
        return self.state.status

    def reserve(self) -> None:
        self.state = self.state.reserve()


class TransportState(Protocol):
    @property
    def status(self) -> TransportStatus: ...

    def assign(self, driver_id: UUID, assigned_at: datetime) -> TransportState: ...


@dataclass(frozen=True)
class AvailableTransportState:
    @property
    def status(self) -> TransportStatus:
        return TransportStatus.DISPONIBLE

    def assign(self, driver_id: UUID, assigned_at: datetime) -> TransportState:
        return AssignedTransportState(driver_id, assigned_at)


@dataclass(frozen=True)
class AssignedTransportState:
    driver_id: UUID
    assigned_at: datetime

    @property
    def status(self) -> TransportStatus:
        return TransportStatus.ASIGNADA

    def assign(self, driver_id: UUID, assigned_at: datetime) -> TransportState:
        raise InvalidTransitionError("La solicitud ya fue asignada.")


def transport_state_for(
    status: TransportStatus,
    driver_id: UUID | None,
    assigned_at: datetime | None,
) -> TransportState:
    if status is TransportStatus.DISPONIBLE:
        if driver_id is not None or assigned_at is not None:
            raise InvalidTransitionError(
                "Una solicitud disponible no puede tener una asignación."
            )
        return AvailableTransportState()
    if driver_id is None or assigned_at is None:
        raise InvalidTransitionError(
            "Una solicitud asignada debe tener voluntario y fecha de asignación."
        )
    return AssignedTransportState(driver_id, assigned_at)


@dataclass
class TransportLifecycle:
    state: TransportState

    @classmethod
    def from_values(
        cls,
        status: TransportStatus,
        driver_id: object | None,
        assigned_at: datetime | None,
    ) -> TransportLifecycle:
        return cls(transport_state_for(status, driver_id, assigned_at))

    @property
    def status(self) -> TransportStatus:
        return self.state.status

    @property
    def driver_id(self) -> UUID | None:
        return getattr(self.state, "driver_id", None)

    @property
    def assigned_at(self) -> datetime | None:
        return getattr(self.state, "assigned_at", None)

    def assign(self, driver_id: UUID) -> None:
        self.state = self.state.assign(driver_id, datetime.now(timezone.utc))

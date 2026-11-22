from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import (
    AuthenticatedActor,
    get_current_actor,
    require_role,
)
from app.db.models import LotStatus, UserRole
from app.schemas import (
    LoteCreate,
    LoteRead,
    ReservaCreate,
    ReservaRead,
    SolicitudTransporteRead,
)
from app.services import LoteService, TransporteService
from app.unit_of_work import UnitOfWork, get_unit_of_work

router = APIRouter(prefix="/api/v1")
UowDependency = Annotated[UnitOfWork, Depends(get_unit_of_work)]


@router.post(
    "/lotes",
    response_model=LoteRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Lotes"],
)
def crear_lote(
    data: LoteCreate,
    uow: UowDependency,
    actor: Annotated[AuthenticatedActor, Depends(require_role(UserRole.DONANTE))],
) -> LoteRead:
    return LoteService(uow).crear(data, actor.user_id)


@router.get("/lotes", response_model=list[LoteRead], tags=["Lotes"])
def listar_lotes(
    uow: UowDependency,
    _: Annotated[AuthenticatedActor, Depends(require_role(UserRole.COMEDOR))],
    estado: LotStatus = Query(default=LotStatus.DISPONIBLE),
) -> list[LoteRead]:
    return LoteService(uow).listar(estado)


@router.get("/lotes/{lote_id}", response_model=LoteRead, tags=["Lotes"])
def obtener_lote(
    lote_id: UUID,
    uow: UowDependency,
    _: Annotated[AuthenticatedActor, Depends(require_role(UserRole.COMEDOR))],
) -> LoteRead:
    return LoteService(uow).obtener(lote_id)


@router.post(
    "/lotes/{lote_id}/reservas",
    response_model=ReservaRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Reservas"],
)
def reservar_lote(
    lote_id: UUID,
    data: ReservaCreate,
    uow: UowDependency,
    actor: Annotated[AuthenticatedActor, Depends(require_role(UserRole.COMEDOR))],
) -> ReservaRead:
    return LoteService(uow).reservar(lote_id, actor.user_id, data)


@router.get(
    "/transporte/solicitudes",
    response_model=list[SolicitudTransporteRead],
    tags=["Transporte"],
)
def listar_solicitudes_transporte(
    uow: UowDependency,
    _: Annotated[AuthenticatedActor, Depends(require_role(UserRole.DRIVER))],
    disponibles: bool = Query(default=True),
) -> list[SolicitudTransporteRead]:
    return TransporteService(uow).listar(disponibles)


@router.post(
    "/transporte/solicitudes/{solicitud_id}/aceptacion",
    response_model=SolicitudTransporteRead,
    tags=["Transporte"],
)
def aceptar_solicitud_transporte(
    solicitud_id: UUID,
    uow: UowDependency,
    actor: Annotated[AuthenticatedActor, Depends(require_role(UserRole.DRIVER))],
) -> SolicitudTransporteRead:
    return TransporteService(uow).aceptar(solicitud_id, actor.user_id)

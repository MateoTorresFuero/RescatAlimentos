from dataclasses import dataclass
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status

from app.db.models import UserRole


@dataclass(frozen=True)
class AuthenticatedActor:
    user_id: UUID
    role: UserRole


def get_current_actor(request: Request) -> AuthenticatedActor:
    actor = getattr(request.state, "current_actor", None)
    if not isinstance(actor, AuthenticatedActor):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Se requiere autenticación.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return actor


def require_role(required_role: UserRole):
    def dependency(
        actor: AuthenticatedActor = Depends(get_current_actor),
    ) -> AuthenticatedActor:
        if actor.role is not required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El rol no tiene permiso para esta operación.",
            )
        return actor

    return dependency

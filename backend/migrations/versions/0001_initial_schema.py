"""Create MVP identity, lot, reservation, and transport tables.

Revision ID: 0001_initial_schema
Revises:
"""

from typing import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

user_role = sa.Enum(
    "DONANTE",
    "COMEDOR",
    "DRIVER",
    "ADMIN",
    name="user_role",
    native_enum=False,
    length=20,
)
account_status = sa.Enum(
    "PENDIENTE",
    "ACTIVO",
    "RECHAZADO",
    name="account_status",
    native_enum=False,
    length=20,
)
lot_status = sa.Enum(
    "DISPONIBLE",
    "RESERVADO",
    name="lot_status",
    native_enum=False,
    length=20,
)
transport_status = sa.Enum(
    "DISPONIBLE",
    "ASIGNADA",
    name="transport_status",
    native_enum=False,
    length=20,
)


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("account_status", account_status, nullable=False),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "lots",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("donor_id", sa.Uuid(), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=False),
        sa.Column("weight_kg", sa.Numeric(10, 2), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("requires_cold_chain", sa.Boolean(), nullable=False),
        sa.Column("pickup_address", sa.String(length=500), nullable=False),
        sa.Column("image_url", sa.String(length=2048), nullable=True),
        sa.Column("status", lot_status, nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["donor_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_lots_donor_id", "lots", ["donor_id"], unique=False)
    op.create_index("ix_lots_expires_at", "lots", ["expires_at"], unique=False)
    op.create_index("ix_lots_status", "lots", ["status"], unique=False)

    op.create_table(
        "reservations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("lot_id", sa.Uuid(), nullable=False),
        sa.Column("comedor_id", sa.Uuid(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["comedor_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["lot_id"], ["lots.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("lot_id", name="uq_reservations_lot_id"),
    )
    op.create_index(
        "ix_reservations_comedor_id",
        "reservations",
        ["comedor_id"],
        unique=False,
    )

    op.create_table(
        "transport_requests",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("reservation_id", sa.Uuid(), nullable=False),
        sa.Column("lot_id", sa.Uuid(), nullable=False),
        sa.Column("pickup_address", sa.String(length=500), nullable=False),
        sa.Column("delivery_address", sa.String(length=500), nullable=False),
        sa.Column("status", transport_status, nullable=False),
        sa.Column("driver_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["driver_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["lot_id"], ["lots.id"]),
        sa.ForeignKeyConstraint(["reservation_id"], ["reservations.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "reservation_id",
            name="uq_transport_reservation_id",
        ),
    )
    op.create_index(
        "ix_transport_requests_status",
        "transport_requests",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_transport_requests_status", table_name="transport_requests")
    op.drop_table("transport_requests")
    op.drop_index("ix_reservations_comedor_id", table_name="reservations")
    op.drop_table("reservations")
    op.drop_index("ix_lots_status", table_name="lots")
    op.drop_index("ix_lots_expires_at", table_name="lots")
    op.drop_index("ix_lots_donor_id", table_name="lots")
    op.drop_table("lots")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

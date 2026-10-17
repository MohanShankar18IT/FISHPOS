import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, UniqueConstraint, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import UserRole


class Permission(Base):
    """
    Granular permission definition for system modules.
    e.g. module='POS', action='CREATE_SALE'
    """
    __tablename__ = "permissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    module = Column(String(50), index=True, nullable=False)  # POS, INVENTORY, PURCHASES, ONLINE_ORDERS, REPORTS, USERS, SETTINGS
    action = Column(String(50), index=True, nullable=False)  # CREATE, READ, UPDATE, DELETE, OVERRIDE, APPROVE
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class RolePermission(Base):
    """
    Role to Permission association mapping.
    """
    __tablename__ = "role_permissions"
    __table_args__ = (UniqueConstraint("role", "permission_id", name="uq_role_permission"),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role = Column(SAEnum(UserRole), index=True, nullable=False)
    permission_id = Column(String(36), ForeignKey("permissions.id"), nullable=False)
    is_granted = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    permission = relationship("Permission")


class SystemSetting(Base):
    """
    Key-value system configuration store (Tax rates, Weighing port, Store currency, etc.).
    """
    __tablename__ = "system_settings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

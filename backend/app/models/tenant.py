# backend/app/models/tenant.py
import uuid
from sqlalchemy import Column, String, UUID
from app.models.base import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    # Outros campos específicos do tenant, como plano, etc.

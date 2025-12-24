# backend/app/services/auth_service.py
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.user import UserCreate
from app.utils.security import get_password_hash, verify_password, create_access_token
import uuid

# Esta dependência do FastAPI extrai o formulário de login
OAuth2PasswordRequestForm = OAuth2PasswordRequestForm

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate) -> User:
    # 1. Criar um novo Tenant para este usuário/empresa
    new_tenant = Tenant(name=f"Tenant for {user.email}")
    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)

    # 2. Criar o usuário associado a esse Tenant
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        tenant_id=new_tenant.id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_token_for_user(user: User) -> str:
    access_token = create_access_token(
        data={"sub": str(user.id), "tenant_id": str(user.tenant_id)}
    )
    return access_token

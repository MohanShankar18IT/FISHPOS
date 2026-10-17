from datetime import timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.permission import Permission, RolePermission
from app.schemas.auth import Token, UserCreate, UserResponse, LoginRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is inactive")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "full_name": user.full_name
    }


@router.post("/login-json", response_model=Token)
def login_json(
    req: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is inactive")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "full_name": user.full_name
    }


@router.get("/roles-permissions")
def get_roles_permissions_matrix(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns the role-based access control matrix across all modules for UI inspection.
    """
    permissions = db.query(Permission).all()
    role_perms = db.query(RolePermission).all()

    # Map role -> set of permission keys
    matrix: Dict[str, Dict[str, bool]] = {r.value: {} for r in UserRole}

    for rp in role_perms:
        perm = next((p for p in permissions if p.id == rp.permission_id), None)
        if perm:
            key = f"{perm.module}:{perm.action}"
            matrix[rp.role.value][key] = rp.is_granted

    return {
        "roles": [r.value for r in UserRole],
        "permissions": [
            {
                "id": p.id,
                "module": p.module,
                "action": p.action,
                "name": p.name,
                "description": p.description,
                "key": f"{p.module}:{p.action}"
            }
            for p in permissions
        ],
        "matrix": matrix
    }


@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        phone=user_in.phone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

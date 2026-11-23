"""Authentication endpoints: Register & Login."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.database.session import get_db
from app.models.schemas import AuthResponse, UserLoginRequest, UserRegisterRequest, UserResponse
from app.models.user import User

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Registers a new user account with unique email, hashes password, and returns a JWT access token.",
)
def register(
    payload: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """User Registration Endpoint.

    - Validates email uniqueness.
    - Securely hashes password via bcrypt.
    - Stores persistent user in SQLite database.
    - Returns JWT token and safe user profile.
    """
    # 1. Check if an account with this email already exists
    stmt = select(User).where(User.email == payload.email)
    existing_user = db.scalar(stmt)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Please sign in instead.",
        )

    # 2. Hash password securely
    hashed_pw = hash_password(payload.password)

    # 3. Create new User record
    new_user = User(
        email=payload.email,
        full_name=payload.full_name,
        phone_number=payload.phone_number,
        hashed_password=hashed_pw,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Generate JWT token
    token = create_access_token({"sub": new_user.id, "email": new_user.email})

    user_data = UserResponse(
        id=new_user.id,
        name=new_user.full_name,
        email=new_user.email,
        phone=new_user.phone_number,
        createdAt=new_user.created_at.isoformat(),
    )

    return AuthResponse(
        token=token,
        access_token=token,
        token_type="bearer",
        user=user_data,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user login",
    description="Validates email and password credentials, returning a JWT access token on success.",
)
def login(
    payload: UserLoginRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """User Login Endpoint.

    - Verifies email and hashed password.
    - Returns HTTP 401 if credentials do not match.
    - Returns JWT token and safe user profile on success.
    """
    stmt = select(User).where(User.email == payload.email)
    user = db.scalar(stmt)

    # Verify user exists and password hash matches
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact support.",
        )

    # Generate JWT token
    token = create_access_token({"sub": user.id, "email": user.email})

    user_data = UserResponse(
        id=user.id,
        name=user.full_name,
        email=user.email,
        phone=user.phone_number,
        createdAt=user.created_at.isoformat(),
    )

    return AuthResponse(
        token=token,
        access_token=token,
        token_type="bearer",
        user=user_data,
    )

"""Pydantic schemas for authentication requests and responses."""

import re
from typing import Any, Optional
from pydantic import BaseModel, Field, field_validator, model_validator


class UserRegisterRequest(BaseModel):
    """Registration request payload."""

    full_name: str = Field(..., min_length=1, max_length=100, description="User's full name")
    email: str = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, max_length=128, description="Account password (min 6 characters)")
    phone_number: Optional[str] = Field(None, max_length=25, description="Optional phone number")

    @model_validator(mode="before")
    @classmethod
    def normalize_aliases(cls, data: Any) -> Any:
        """Allow frontend to send 'name' or 'full_name', and 'phone' or 'phone_number'."""
        if isinstance(data, dict):
            # Map 'name' -> 'full_name' if needed
            if "name" in data and "full_name" not in data:
                data["full_name"] = data["name"]
            # Map 'phone' -> 'phone_number' if needed
            if "phone" in data and "phone_number" not in data:
                data["phone_number"] = data["phone"]
        return data

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, value: str) -> str:
        clean_email = value.strip().lower()
        email_regex = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
        if not re.match(email_regex, clean_email):
            raise ValueError("Invalid email address format.")
        return clean_email

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        clean_name = value.strip()
        if not clean_name:
            raise ValueError("Full name cannot be empty.")
        return clean_name

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value) < 6:
            raise ValueError("Password must be at least 6 characters.")
        return value


class UserLoginRequest(BaseModel):
    """Login request payload."""

    email: str = Field(..., description="User's registered email")
    password: str = Field(..., min_length=1, description="Account password")

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return value.strip().lower()


class UserResponse(BaseModel):
    """User profile data returned to client (never contains passwords or hashes)."""

    id: str
    name: str
    email: str
    phone: Optional[str] = None
    createdAt: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response payload containing JWT and user profile."""

    token: str
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

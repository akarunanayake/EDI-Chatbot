from pydantic import BaseModel, Field


class AuthRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)
    name: str | None = Field(default=None, min_length=1)
    email: str | None = Field(default=None, min_length=1)
    institution: str | None = Field(default=None, min_length=1)


class AuthResponse(BaseModel):
    success: bool
    user_id: int | None = None
    username: str | None = None
    message: str | None = None
    name: str | None = None
    email: str | None = None
    institution: str | None = None


class ForgotPasswordRequest(BaseModel):
    username: str = Field(min_length=1)
    email: str = Field(min_length=1)
    new_password: str = Field(min_length=8)

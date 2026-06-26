from pydantic import BaseModel, Field


class AuthRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class AuthResponse(BaseModel):
    success: bool
    user_id: int | None = None
    username: str | None = None
    message: str | None = None

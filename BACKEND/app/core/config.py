import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    PROJECT_NAME: str = "Fish POS Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "default-insecure-secret-key-change-in-production-fish-pos-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12  # 12 hours for shift cashiers

    # Database
    DATABASE_URL: str = "sqlite:///./fish_pos.db"  # Defaults to SQLite for local dev if Postgres is not running

    # Store Settings
    DEFAULT_STORE_CODE: str = "STORE-001"
    DEFAULT_STORE_NAME: str = "Meanomeen Fish Outlet"
    DEFAULT_CURRENCY: str = "INR"
    DEFAULT_TAX_RATE: float = 5.0  # 5% GST on fresh & processed seafood
    AUTO_RESERVE_ONLINE_STOCK: bool = True

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]


settings = Settings()

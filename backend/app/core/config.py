from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "MatrixFlow Enterprise API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    API_V1_PREFIX: str = "/api/v1"

    FRONTEND_URL: str = "http://localhost:5173"

    DATABASE_URL: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()
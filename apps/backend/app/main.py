from fastapi import FastAPI

from app.config import settings
from app.api.router import api_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

app.include_router(api_router, prefix=settings.api_prefix)

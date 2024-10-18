from fastapi import APIRouter, HTTPException
from app.services.spotify_service import spotify_service
from app.core.celery_app import celery_app

router = APIRouter()

@router.get("/")
async def home():
    raise HTTPException(status_code=500, detail="Not Implemented")
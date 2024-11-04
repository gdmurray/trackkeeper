from fastapi import FastAPI
# from app.api.routes import spotify
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import api, test
from app.core.logging import setup_logging

# TODO: Check if auth from web app transfers over to python backend
# TODO: Do I need to have a POST endpoint from my supabase instance that sets stuff up for a user
# TODO: Need an endpoint which gets invoked when a user signs up?

# Initialize Logger
logger = setup_logging(settings.PROJECT_NAME)


def get_app() -> FastAPI:
    fast_api_app = FastAPI(title=settings.PROJECT_NAME)
    logger.info("Initializing FastAPI App", extra={"env": settings.ENV})

    if settings.ENV == "development":
        fast_api_app.include_router(test.router)
        logger.debug("Included test router for development environment")

    return fast_api_app


app = get_app()

allowed_origins = [settings.FRONTEND_URL]
if settings.ENV == "development":
    allowed_origins.append("http://localhost:3000")

# Set up cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api.router, prefix="/api", tags=["api"])


@app.get("/")
async def root():
    return {"message": "Welcome to the TrackKeeper FastAPI server"}


@app.get("/health")
async def health_check():
    return {"status": "success", "message": "Service is healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

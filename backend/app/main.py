from fastapi import FastAPI
# from app.api.routes import spotify
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# TODO: Implement Flower UI with login + password
# TODO: Check if auth from web app transfers over to python backend
# TODO: Do I need to have a POST endpoint from my supabase instance that sets stuff up for a user
# TODO: Need an endpoint which gets invoked when a user signs up?

app = FastAPI(title=settings.PROJECT_NAME)

# Set up cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://trackkeeper.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(spotify.router, prefix="/api/spotify", tags=["spotify"])

@app.get("/")
async def root():
    print("Hello")
    return {"message": "Welcome to the FastAPI server"}


@app.get("/health")
async def health_check():
    return {"status": "success", "message": "Service is healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
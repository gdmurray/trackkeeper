# Authentication dependency
from fastapi import HTTPException, Request
from jose import jwt
from app.core.config import settings
from app.db.supabase import supabase

async def get_current_user(request: Request):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    try:
        # Verify the JWT token
        payload = jwt.decode(token.split()[1], settings.SUPABASE_JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        
        # Fetch user info from Supabase
        user = supabase.auth.admin.get_user(user_id)
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

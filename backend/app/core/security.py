from typing import Union
from jose import jwt, JWTError
from datetime import datetime, timezone, timedelta
from app.core.config import settings

def create_unsubscribe_token(user_id: str) -> str:
    """
    Create a JWT token for email unsubscribe links.
    The token expires in 1 year to ensure unsubscribe links in old emails still work.
    """

    payload = {
        'sub': user_id,
        'type': 'unsubscribe',
        'exp': datetime.now(timezone.utc) + timedelta(days=365),
        'iat': datetime.now(timezone.utc)
    }

    token = jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    return token

def verify_unsubscribe_token(user_id: str, token: str) -> Union[bool, None]:
    """
    Verify that an unsubscribe token is valid and matches the user_id.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=['HS256']
        )
        
        return (
            payload['sub'] == user_id and
            payload['type'] == 'unsubscribe' and
            datetime.utcfromtimestamp(payload['exp']) > datetime.utcnow()
        )
    except JWTError:
        return False
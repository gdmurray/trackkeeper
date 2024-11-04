from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from app.core.security import verify_unsubscribe_token
from app.db.supabase import supabase
router = APIRouter()

@router.get("/unsubscribe/{user_id}/token", response_class=HTMLResponse)
async def unsubscribe(user_id: str, token: str):
    try:
        if not verify_unsubscribe_token(user_id, token):
            raise HTTPException(status_code=400, detail="Invalid unsubscribe token")
        
       # Update User Settings
        result = supabase.table('User Settings').update({
            'suggestion_emails': False
        }).eq('user_id', user_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="User settings not found")

        # Return confirmation HTML page
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Unsubscribed from Emails</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 0 20px;
                    text-align: center;
                }
                .container {
                    background: #fff;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                h1 { color: #333; }
                p { color: #666; }
                .link {
                    color: #2563eb;
                    text-decoration: none;
                }
                .link:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Successfully Unsubscribed</h1>
                <p>You've been unsubscribed from Trackkeeper suggestion emails.</p>
                <p>You can always resubscribe from your 
                    <a href="https://trackkeeper.app/settings/email" class="link">Trackkeeper settings</a>
                    if you change your mind.</p>
            </div>
        </body>
        </html>
        """
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
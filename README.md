# TrackKeeper

![TrackKeeper Logo](public/logo.png)

TrackKeeper is a web application that helps Spotify users keep track of their removed songs. Never lose track of your music again - TrackKeeper monitors your Spotify playlists and maintains a record of removed tracks.

## 🎵 Features

### Core Functionality
- **Spotify Integration**: Seamless connection with your Spotify account
- **Playlist Monitoring**: Track changes in your liked songs and specific playlists
- **Removal Detection**: Automatically detect when songs are removed from your tracked playlists
- **Historical Records**: Keep a detailed history of all removed tracks
- **Email Notifications**: Get notified when songs are removed from your playlists
- **Accident Detection**: Smart detection of potentially accidentally removed songs

### User Experience
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **Dark Mode**: Optimized dark theme for comfortable viewing
- **Mobile-Friendly**: Fully responsive design that works on all devices
- **Real-time Updates**: Instant feedback on playlist changes

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js 15.0
- **UI Components**: Custom components built with Radix UI and shadcn/ui
- **Styling**: Tailwind CSS with custom configuration
- **State Management**: React Query for server state
- **Authentication**: Supabase Auth
- **Type Safety**: TypeScript

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL (via Supabase)
- **Task Queue**: Celery
- **Email Service**: Resend
- **Monitoring**: Flower for task monitoring
- **Container**: Docker

## 🛠️ Setup and Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/track-keeper.git
cd track-keeper
```

2. Install dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

3. Set up environment variables
```bash
# Frontend (.env)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Backend (.env)
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
RESEND_API_KEY=your_resend_api_key
```

4. Run the development servers
```bash
# Frontend
npm run dev

# Backend
uvicorn app.main:app --reload
```

## 📐 Architecture

TrackKeeper follows a modern microservices architecture:

1. **Frontend Service**: Next.js application handling user interface and interactions
2. **Backend Service**: FastAPI server managing business logic and Spotify API integration
3. **Background Workers**: Celery workers for playlist monitoring and email notifications
4. **Database**: PostgreSQL database managed through Supabase
5. **Cache Layer**: Redis for task queue and caching

## 🔒 Security Features

- Secure authentication via Supabase
- Environment variable protection
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- Secure password handling

## 📧 Email Templates

TrackKeeper uses custom MJML email templates for notifications, including:
- Weekly digest of removed songs
- Accident detection alerts
- Account notifications

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- All our contributors and supporters

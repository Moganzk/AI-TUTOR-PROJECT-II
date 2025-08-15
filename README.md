
# AI Tutor Project

An intelligent tutoring system with AI-powered assistance, course management, and real-time collaboration features.

## Features

- **AI-Powered Tutoring**: Interactive AI tutor using Groq API for personalized learning assistance
- **Course Management**: Complete course creation, enrollment, and management system
- **Assignment System**: Create, assign, and grade assignments with automated feedback
- **Real-time Collaboration**: WebSocket-based real-time communication and notifications
- **Role-based Access Control**: Support for students, staff, and administrators
- **Analytics Dashboard**: Comprehensive analytics for tracking student progress and system usage
- **Responsive Design**: Modern React frontend with Tailwind CSS

## Tech Stack

### Backend
- **Flask**: Python web framework
- **Supabase**: PostgreSQL database and authentication
- **Groq API**: AI language model integration
- **SocketIO**: Real-time communication
- **JWT**: Secure authentication
- **Redis**: Caching and session management

### Frontend
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Chart.js**: Data visualization
- **Framer Motion**: Animations

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (via Supabase)
- Redis (optional, for caching)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/Moganzk/AI-TUTOR-PROJECT-II.git
cd AI-TUTOR-PROJECT-II
```

2. Set up environment variables:
Create a `.env` file in the root directory with:
```env
# Flask Configuration
SECRET_KEY=your-flask-secret-key
JWT_SECRET=your-jwt-secret-key
FLASK_DEBUG=True

# Supabase Configuration
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
REACT_APP_SERVICE_ROLE=your-supabase-service-role-key

# Groq AI Configuration
GROQ_API_KEY=your-groq-api-key
AI_MODEL=llama3-70b-8192

# Server Configuration
HOST=0.0.0.0
PORT=5000
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run database migrations:
```bash
python run_analytics_migration.py
```

5. Start the backend server:
```bash
python app.py
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
AI-TUTOR-PROJECT-II/
├── backend/                    # Flask backend application
│   ├── routes/                # API route handlers
│   ├── services/              # Business logic services
│   ├── middleware/            # Authentication and CORS middleware
│   ├── Database_modules/      # Database interaction modules
│   ├── migrations/            # Database migration scripts
│   └── templates/             # HTML templates
├── frontend/                  # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   └── public/               # Static assets
├── supabase/                 # Database schema and migrations
└── docx/                     # Project documentation
```

## API Documentation

The backend provides a RESTful API with the following main endpoints:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Courses**: `/api/courses/*`
- **Assignments**: `/api/assignments/*`
- **AI Tutor**: `/api/ai-tutor/*`
- **Analytics**: `/api/analytics/*`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.

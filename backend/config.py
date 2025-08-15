import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-flask-secret-key-change-this')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ['true', '1', 'yes']
    
    # Server Configuration
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET', 'your-super-secure-jwt-secret-key-change-this')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv('JWT_EXPIRATION_HOURS', 24)))
    JWT_ALGORITHM = 'HS256'
    
    # Supabase Configuration
    SUPABASE_URL = os.getenv('REACT_APP_SUPABASE_URL')
    SUPABASE_KEY = os.getenv('REACT_APP_SUPABASE_KEY')
    SUPABASE_SERVICE_ROLE = os.getenv('REACT_APP_SERVICE_ROLE')
    
    # AI Configuration (Groq)
    GROQ_API_KEY = os.getenv('GROQ_API_KEY')
    AI_MODEL = os.getenv('AI_MODEL', 'llama3-70b-8192')
    AI_TEMPERATURE = float(os.getenv('AI_TEMPERATURE', 0.7))
    AI_MAX_TOKENS = int(os.getenv('AI_MAX_TOKENS', 1000))
    
    # CORS Configuration
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']
    
    # Database Configuration
    DATABASE_URL = None  # Using Supabase instead
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
    
    # Pagination Configuration
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    
    # Rate Limiting Configuration
    RATE_LIMIT_ENABLED = True
    RATE_LIMIT_DEFAULT = "100 per hour"
    
    @classmethod
    def validate_config(cls):
        """Validate required configuration variables"""
        required_vars = [
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE',  # Use service role for backend
            'GROQ_API_KEY'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not getattr(cls, var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        return True

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Enhanced security for production
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)  # Shorter token life in production
    RATE_LIMIT_DEFAULT = "60 per hour"  # Stricter rate limiting

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)  # Short-lived tokens for testing

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])

from groq import Groq
from typing import List, Dict, Any, Optional
import logging
from config import get_config
from services.database import db_service

logger = logging.getLogger(__name__)

class AIService:
    """AI service using Groq API for chat and content generation"""
    
    def __init__(self):
        self.config = get_config()
        self._client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Groq client"""
        try:
            if not self.config.GROQ_API_KEY:
                raise ValueError("Groq API key is required")
            
            self._client = Groq(api_key=self.config.GROQ_API_KEY)
            logger.info("Groq AI client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {str(e)}")
            raise
    
    @property
    def client(self) -> Groq:
        """Get Groq client instance"""
        if self._client is None:
            self._initialize_client()
        return self._client
    
    def chat_completion(self, messages: List[Dict[str, str]], user_id: str, session_id: str = None) -> Dict[str, Any]:
        """
        Generate AI chat response using Groq
        
        Args:
            messages: List of message objects with 'role' and 'content'
            user_id: ID of the user making the request
            session_id: Optional chat session ID
        
        Returns:
            Dict containing response and metadata
        """
        try:
            # Create chat session if not provided
            if not session_id:
                session = db_service.create_chat_session(user_id)
                session_id = session['id'] if session else None
            
            # Prepare system message for educational context
            system_message = {
                "role": "system",
                "content": (
                    "You are an AI tutor assistant. Your role is to help students learn by:\n"
                    "1. Providing clear, educational explanations\n"
                    "2. Breaking down complex topics into digestible parts\n"
                    "3. Encouraging critical thinking with guided questions\n"
                    "4. Providing examples and practice problems when appropriate\n"
                    "5. Being patient and supportive\n"
                    "Always maintain a helpful, encouraging tone and focus on educational value."
                )
            }
            
            # Combine system message with conversation
            full_messages = [system_message] + messages
            
            # Make API call to Groq
            start_time = __import__('time').time()
            response = self.client.chat.completions.create(
                model=self.config.AI_MODEL,
                messages=full_messages,
                temperature=self.config.AI_TEMPERATURE,
                max_tokens=self.config.AI_MAX_TOKENS,
                top_p=1,
                stream=False
            )
            end_time = __import__('time').time()
            
            # Extract response data
            ai_response = response.choices[0].message.content
            response_time_ms = int((end_time - start_time) * 1000)
            
            # Save user message to database
            if session_id:
                user_message = messages[-1] if messages else None
                if user_message:
                    db_service.save_chat_message({
                        'session_id': session_id,
                        'user_id': user_id,
                        'role': user_message['role'],
                        'content': user_message['content']
                    })
                
                # Save AI response to database
                db_service.save_chat_message({
                    'session_id': session_id,
                    'user_id': user_id,
                    'role': 'assistant',
                    'content': ai_response
                })
                
                # Save AI interaction metadata
                try:
                    db_service.client.table('ai_interactions').insert({
                        'session_id': session_id,
                        'user_id': user_id,
                        'model_used': self.config.AI_MODEL,
                        'prompt_tokens': response.usage.prompt_tokens if hasattr(response, 'usage') else 0,
                        'completion_tokens': response.usage.completion_tokens if hasattr(response, 'usage') else 0,
                        'total_tokens': response.usage.total_tokens if hasattr(response, 'usage') else 0,
                        'response_time_ms': response_time_ms
                    }).execute()
                except Exception as e:
                    logger.warning(f"Failed to save AI interaction metadata: {str(e)}")
            
            return {
                'success': True,
                'response': ai_response,
                'session_id': session_id,
                'metadata': {
                    'model': self.config.AI_MODEL,
                    'response_time_ms': response_time_ms,
                    'tokens_used': getattr(response.usage, 'total_tokens', 0) if hasattr(response, 'usage') else 0
                }
            }
            
        except Exception as e:
            logger.error(f"AI chat completion error: {str(e)}")
            return {
                'success': False,
                'error': f"AI service error: {str(e)}",
                'response': "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
            }
    
    def generate_content(self, prompt: str, content_type: str = "general") -> Dict[str, Any]:
        """
        Generate educational content using AI
        
        Args:
            prompt: The generation prompt
            content_type: Type of content (quiz, assignment, explanation, etc.)
        
        Returns:
            Dict containing generated content
        """
        try:
            # Customize system message based on content type
            system_messages = {
                "quiz": "Generate educational quiz questions with multiple choice answers. Format as JSON with questions, options, and correct answers.",
                "assignment": "Create a comprehensive assignment prompt with clear instructions, learning objectives, and grading criteria.",
                "explanation": "Provide a clear, detailed explanation suitable for educational purposes. Use examples and break down complex concepts.",
                "general": "Generate helpful educational content based on the request."
            }
            
            system_message = system_messages.get(content_type, system_messages["general"])
            
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ]
            
            response = self.client.chat.completions.create(
                model=self.config.AI_MODEL,
                messages=messages,
                temperature=self.config.AI_TEMPERATURE,
                max_tokens=self.config.AI_MAX_TOKENS,
                top_p=1,
                stream=False
            )
            
            generated_content = response.choices[0].message.content
            
            return {
                'success': True,
                'content': generated_content,
                'content_type': content_type,
                'metadata': {
                    'model': self.config.AI_MODEL,
                    'tokens_used': getattr(response.usage, 'total_tokens', 0) if hasattr(response, 'usage') else 0
                }
            }
            
        except Exception as e:
            logger.error(f"AI content generation error: {str(e)}")
            return {
                'success': False,
                'error': f"Content generation error: {str(e)}",
                'content': None
            }
    
    def analyze_assignment_submission(self, submission_content: str, assignment_prompt: str, rubric: List[Dict] = None) -> Dict[str, Any]:
        """
        Analyze and provide feedback on assignment submissions
        
        Args:
            submission_content: The student's submission
            assignment_prompt: The original assignment prompt
            rubric: Optional rubric for grading
        
        Returns:
            Dict containing analysis and feedback
        """
        try:
            # Build analysis prompt
            analysis_prompt = f"""
            Please analyze this student submission and provide constructive feedback.
            
            Assignment Prompt:
            {assignment_prompt}
            
            Student Submission:
            {submission_content}
            
            Please provide:
            1. Strengths of the submission
            2. Areas for improvement
            3. Specific suggestions for enhancement
            4. Overall assessment
            
            Be constructive, specific, and encouraging in your feedback.
            """
            
            if rubric:
                rubric_text = "\n".join([f"- {item.get('criteria', '')}: {item.get('description', '')}" for item in rubric])
                analysis_prompt += f"\n\nGrading Rubric:\n{rubric_text}"
            
            messages = [
                {
                    "role": "system", 
                    "content": "You are an experienced educator providing feedback on student work. Be constructive, specific, and encouraging."
                },
                {"role": "user", "content": analysis_prompt}
            ]
            
            response = self.client.chat.completions.create(
                model=self.config.AI_MODEL,
                messages=messages,
                temperature=0.3,  # Lower temperature for more consistent feedback
                max_tokens=self.config.AI_MAX_TOKENS,
                top_p=1,
                stream=False
            )
            
            feedback = response.choices[0].message.content
            
            return {
                'success': True,
                'feedback': feedback,
                'metadata': {
                    'model': self.config.AI_MODEL,
                    'tokens_used': getattr(response.usage, 'total_tokens', 0) if hasattr(response, 'usage') else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Assignment analysis error: {str(e)}")
            return {
                'success': False,
                'error': f"Analysis error: {str(e)}",
                'feedback': "Unable to analyze submission at this time."
            }
    
    def health_check(self) -> Dict[str, Any]:
        """Check AI service health"""
        try:
            # Simple test request
            test_messages = [
                {"role": "system", "content": "Respond with 'OK' for health check"},
                {"role": "user", "content": "Health check"}
            ]
            
            response = self.client.chat.completions.create(
                model=self.config.AI_MODEL,
                messages=test_messages,
                temperature=0,
                max_tokens=10,
                top_p=1,
                stream=False
            )
            
            return {
                'status': 'healthy',
                'message': 'AI service is operational',
                'model': self.config.AI_MODEL,
                'response': response.choices[0].message.content.strip()
            }
            
        except Exception as e:
            logger.error(f"AI health check failed: {str(e)}")
            return {
                'status': 'unhealthy',
                'message': f'AI service error: {str(e)}',
                'model': self.config.AI_MODEL
            }

# Global AI service instance
ai_service = AIService()

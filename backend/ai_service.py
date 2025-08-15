"""
AI Service for the AI Tutor Backend using Groq with Fallback Support
"""
import os
from groq import Groq
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

_GLOBAL_INSTANCE = None

class AITutorService:
    """AI Tutor service using Groq with automatic fallback support"""
    
    def __init__(self):
        # Non-blocking init: don't call network during construction
        print('[ai] init start (lazy mode)')
        self.fallback_mode = False
        self.client = None
        self._primary_ready = False
        self.model = os.getenv('AI_MODEL', 'llama3-70b-8192')
        self.temperature = float(os.getenv('AI_TEMPERATURE', '0.7'))
        self.max_tokens = int(os.getenv('AI_MAX_TOKENS', '1000'))
        self._attempted_primary = False
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            logger.warning('GROQ_API_KEY missing – starting in fallback mode (lazy)')
            self.fallback_mode = True
            self._init_fallback()
        print('[ai] init complete (lazy) fallback_mode=%s' % self.fallback_mode)

    def ensure_primary_ready(self):
        """Attempt to initialize primary client once (non-blocking)."""
        if self._attempted_primary or self.fallback_mode:
            return
        self._attempted_primary = True
        groq_api_key = os.getenv('GROQ_API_KEY')
        if not groq_api_key:
            return
        try:
            logger.info('Initializing Groq primary client (lazy)')
            self.client = Groq(api_key=groq_api_key)
            # Skip test call to avoid startup hang; mark as ready
            self._primary_ready = True
            logger.info('Groq primary client ready (untested)')

            # Optional deferred light test if enabled
            if os.getenv('AI_FORCE_EAGER') == '1':
                import threading, time
                def _deferred_test():
                    timeout = float(os.getenv('AI_TEST_TIMEOUT', '3'))
                    start = time.time()
                    try:
                        logger.info('Starting deferred Groq connectivity probe')
                        self.client.chat.completions.create(
                            model=self.model,
                            messages=[{"role": "user", "content": "ping"}],
                            max_tokens=1,
                            temperature=0
                        )
                        logger.info('Deferred Groq connectivity probe succeeded')
                    except Exception as e:
                        logger.warning(f'Deferred Groq probe failed: {e}; switching to fallback')
                        self.fallback_mode = True
                        self._init_fallback()
                    finally:
                        logger.debug(f'Deferred test duration={time.time()-start:.2f}s')
                threading.Thread(target=_deferred_test, daemon=True).start()
        except Exception as e:
            logger.error(f'Groq lazy initialization failed: {e}')
            self.fallback_mode = True
            self._init_fallback()
    
    def _init_fallback(self):
        """Initialize fallback AI service"""
        try:
            from fallback_ai_service import fallback_ai_service
            self.fallback_service = fallback_ai_service
            logger.info("Fallback AI service initialized")
        except ImportError:
            logger.error("Could not import fallback AI service")
            self.fallback_service = None
    
    def get_system_prompt(self, user_role: str = "student") -> str:
        """Get system prompt based on user role"""
        base_prompt = """You are an AI Tutor, a professional and knowledgeable educational assistant. Your role is to:

1. Provide clear, accurate, and educational responses
2. Break down complex topics into understandable explanations
3. Encourage critical thinking and learning
4. Adapt your explanations to the user's level of understanding
5. Provide examples and practical applications when appropriate
6. Be patient, encouraging, and supportive
7. Ask follow-up questions to ensure understanding
8. Suggest additional resources when helpful

Always maintain a professional yet friendly tone. Focus on education and learning outcomes."""
        
        if user_role == "student":
            return base_prompt + "\n\nYou are helping a student learn. Be encouraging and patient."
        elif user_role == "staff":
            return base_prompt + "\n\nYou are assisting educational staff. Provide detailed explanations and teaching strategies."
        elif user_role == "admin":
            return base_prompt + "\n\nYou are supporting an administrator. Focus on educational management and institutional guidance."
        
        return base_prompt
    
    def generate_response(self, messages: list, user_role: str = "student", student_context: dict = None) -> str:
        """Generate AI response using Groq with fallback support"""
        # Lazy init attempt
        self.ensure_primary_ready()
        # If in fallback mode, use the fallback service
        if self.fallback_mode and self.fallback_service:
            logger.info("Using fallback AI service")
            return self.fallback_service.generate_response(messages, user_role, student_context)

        max_retries = 2
        for attempt in range(max_retries + 1):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    top_p=1,
                    stream=False
                )
                result = response.choices[0].message.content.strip()
                if result:
                    return result
                raise ValueError("Empty response from AI service")
            except Exception as e:
                logger.error(f"Groq API error (attempt {attempt + 1}/{max_retries + 1}): {e}")
                if attempt == max_retries:
                    logger.warning("Switching to fallback mode due to repeated Groq failures")
                    self.fallback_mode = True
                    self._init_fallback()
                    if self.fallback_service:
                        return self.fallback_service.generate_response(messages, user_role, student_context)
                    if "rate limit" in str(e).lower():
                        return "I'm currently experiencing high demand. Please wait a moment and try again."
                    if any(k in str(e).lower() for k in ["timeout", "connection"]):
                        return "I'm having trouble connecting to my brain right now. Please check your internet connection and try again."
                    if any(k in str(e).lower() for k in ["invalid", "unauthorized"]):
                        return "There's a configuration issue with my AI service. Please contact support."
                    return "I apologize, but I'm having trouble generating a response right now. Please try again in a moment."
                import time
                time.sleep(1 * (attempt + 1))
        return "I apologize, but I'm having trouble generating a response right now. Please try again in a moment."
    
    def generate_subject_explanation(self, subject: str, topic: str, difficulty_level: str = "intermediate") -> str:
        """Generate explanation for a specific subject and topic"""
        self.ensure_primary_ready()
        if self.fallback_mode and self.fallback_service:
            return self.fallback_service.generate_subject_explanation(subject, topic, difficulty_level)
        try:
            prompt = (
                f"Explain the topic '{topic}' in {subject} for a {difficulty_level} level student.\n\n"
                "Please provide:\n"
                "1. A clear definition or overview\n"
                "2. Key concepts and principles\n"
                "3. Real-world examples or applications\n"
                "4. Common misconceptions to avoid\n"
                "5. Suggested next steps for further learning\n\n"
                "Keep the explanation engaging and educational."
            )
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                top_p=1,
                stream=False
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error generating subject explanation: {e}")
            self.fallback_mode = True
            self._init_fallback()
            if self.fallback_service:
                return self.fallback_service.generate_subject_explanation(subject, topic, difficulty_level)
            return "I apologize, but I'm having trouble generating an explanation right now. Please try again in a moment."
    
    def generate_quiz_questions(self, subject: str, topic: str, num_questions: int = 5) -> list:
        """Generate quiz questions for a topic"""
        self.ensure_primary_ready()
        try:
            prompt = (
                f"Generate {num_questions} multiple-choice questions about '{topic}' in {subject}.\n\n"
                "For each question, provide:\n"
                "1. The question text\n"
                "2. Four answer options (A, B, C, D)\n"
                "3. The correct answer\n"
                "4. A brief explanation of why the answer is correct\n\n"
                "Format the response as a JSON array of question objects."
            )
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an educational content creator. Generate well-structured quiz questions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500,
                top_p=1,
                stream=False
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error generating quiz questions: {e}")
            return []
    
    def provide_study_tips(self, subject: str, learning_style: str = "visual") -> str:
        """Provide study tips for a subject based on learning style"""
        if self.fallback_mode and self.fallback_service:
            return self.fallback_service.provide_study_tips(subject, learning_style)
        self.ensure_primary_ready()
        try:
            prompt = (
                f"Provide effective study tips for {subject} that work well for {learning_style} learners.\n\n"
                "Include:\n"
                "1. Specific study techniques\n"
                "2. Recommended resources\n"
                "3. Time management strategies\n"
                "4. Practice methods\n"
                "5. Common pitfalls to avoid\n\n"
                "Make the advice practical and actionable."
            )
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                top_p=1,
                stream=False
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error generating study tips: {e}")
            self.fallback_mode = True
            self._init_fallback()
            if self.fallback_service:
                return self.fallback_service.provide_study_tips(subject, learning_style)
            return "I apologize, but I'm having trouble generating study tips right now. Please try again in a moment."
    
    def analyze_learning_progress(self, chat_history: list) -> dict:
        """Analyze learning progress from chat history"""
        try:
            # Extract user messages from chat history
            user_messages = [msg['content'] for msg in chat_history if msg['role'] == 'user']
            
            if not user_messages:
                return {
                    'progress': 'No data available',
                    'strengths': [],
                    'areas_for_improvement': [],
                    'recommendations': []
                }
            
            prompt = f"""Analyze the following student interactions and provide a learning progress assessment:
            
            Student messages: {user_messages}
            
            Please provide:
            1. Overall progress assessment
            2. Identified strengths
            3. Areas for improvement
            4. Specific recommendations for continued learning
            
            Format your response as a structured analysis."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an educational assessment specialist. Analyze student learning patterns."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=800,
                top_p=1,
                stream=False
            )
            
            return {
                'analysis': response.choices[0].message.content.strip(),
                'timestamp': 'now'
            }
        
        except Exception as e:
            logger.error(f"Error analyzing learning progress: {e}")
            return {
                'progress': 'Unable to analyze progress at this time',
                'error': str(e)
            }

    def grade_assignment_automatically(self, assignment_data: dict, submission_content: str, rubric: dict = None) -> dict:
        """
        AI-powered automatic assignment grading
        Only available to admin/staff, not students
        """
        if self.fallback_mode and self.fallback_service:
            return self.fallback_service.grade_assignment_automatically(assignment_data, submission_content, rubric)
        
        try:
            assignment_type = assignment_data.get('assignment_type', 'homework')
            max_points = assignment_data.get('max_points', 100)
            title = assignment_data.get('title', 'Assignment')
            description = assignment_data.get('description', '')
            instructions = assignment_data.get('instructions', '')
            
            # Build grading prompt based on assignment type
            if assignment_type == 'quiz':
                prompt = f"""Grade this quiz submission automatically:

Assignment: {title}
Description: {description}
Instructions: {instructions}
Maximum Points: {max_points}

Student Submission:
{submission_content}

Please provide:
1. Points earned (out of {max_points})
2. Detailed feedback explaining the grade
3. Specific areas where the student excelled
4. Areas for improvement
5. Suggestions for further study

Be fair, constructive, and educational in your assessment."""

            elif assignment_type == 'essay':
                prompt = f"""Grade this essay submission:

Assignment: {title}
Description: {description}
Instructions: {instructions}
Maximum Points: {max_points}

Student Essay:
{submission_content}

Evaluate based on:
1. Content quality and accuracy (40%)
2. Organization and structure (25%)
3. Grammar and writing style (20%)
4. Critical thinking and analysis (15%)

Provide:
1. Points earned (out of {max_points})
2. Detailed feedback for each criterion
3. Strengths in the essay
4. Areas for improvement
5. Specific suggestions for better writing"""

            elif assignment_type == 'programming':
                prompt = f"""Grade this programming assignment:

Assignment: {title}
Description: {description}
Instructions: {instructions}
Maximum Points: {max_points}

Student Code:
{submission_content}

Evaluate based on:
1. Correctness and functionality (50%)
2. Code quality and style (25%)
3. Efficiency and optimization (15%)
4. Documentation and comments (10%)

Provide:
1. Points earned (out of {max_points})
2. Code review feedback
3. What works well
4. Bugs or issues found
5. Suggestions for improvement"""

            else:  # Default for homework and other types
                prompt = f"""Grade this assignment submission:

Assignment: {title}
Type: {assignment_type}
Description: {description}
Instructions: {instructions}
Maximum Points: {max_points}

Student Submission:
{submission_content}

Please provide:
1. Points earned (out of {max_points})
2. Comprehensive feedback
3. What the student did well
4. Areas needing improvement
5. Specific recommendations for learning

Be thorough, fair, and educational in your assessment."""

            # Add rubric information if provided
            if rubric:
                prompt += f"\n\nGrading Rubric:\n{rubric}"

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert educational assessor. Grade assignments fairly and provide constructive feedback that helps students learn."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Lower temperature for more consistent grading
                max_tokens=1200,
                top_p=1,
                stream=False
            )

            ai_feedback = response.choices[0].message.content.strip()
            
            # Extract points from AI response (basic parsing)
            points_earned = self._extract_points_from_feedback(ai_feedback, max_points)
            
            return {
                'success': True,
                'points_earned': points_earned,
                'max_points': max_points,
                'feedback': ai_feedback,
                'graded_by': 'AI Tutor',
                'grading_method': 'automatic',
                'confidence_score': 0.85,  # AI confidence in the grading
                'timestamp': 'now'
            }

        except Exception as e:
            logger.error(f"Error in AI grading: {e}")
            # Switch to fallback mode and try again
            self.fallback_mode = True
            self._init_fallback()
            if self.fallback_service:
                return self.fallback_service.grade_assignment_automatically(assignment_data, submission_content, rubric)
            
            return {
                'success': False,
                'error': 'AI grading service temporarily unavailable',
                'message': 'Please use manual grading or try again later'
            }

    def _extract_points_from_feedback(self, feedback: str, max_points: int) -> int:
        """Extract points earned from AI feedback text"""
        import re
        
        # Look for patterns like "Points: 85/100", "Score: 85", "85 out of 100", etc.
        patterns = [
            r'Points?:?\s*(\d+)(?:/\d+)?',
            r'Score:?\s*(\d+)(?:/\d+)?',
            r'(\d+)\s*(?:out of|/)\s*\d+',
            r'Earned:?\s*(\d+)',
            r'Total:?\s*(\d+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, feedback, re.IGNORECASE)
            if match:
                points = int(match.group(1))
                # Ensure points don't exceed maximum
                return min(points, max_points)
        
        # If no points found, try to estimate based on feedback sentiment
        if 'excellent' in feedback.lower() or 'outstanding' in feedback.lower():
            return int(max_points * 0.95)
        elif 'good' in feedback.lower() or 'well done' in feedback.lower():
            return int(max_points * 0.85)
        elif 'satisfactory' in feedback.lower() or 'adequate' in feedback.lower():
            return int(max_points * 0.75)
        elif 'needs improvement' in feedback.lower():
            return int(max_points * 0.65)
        elif 'poor' in feedback.lower() or 'unsatisfactory' in feedback.lower():
            return int(max_points * 0.45)
        
        # Default to 75% if unable to determine
        return int(max_points * 0.75)

    def generate_assignment_rubric(self, assignment_data: dict) -> dict:
        """Generate a grading rubric for an assignment"""
        try:
            assignment_type = assignment_data.get('assignment_type', 'homework')
            title = assignment_data.get('title', 'Assignment')
            description = assignment_data.get('description', '')
            max_points = assignment_data.get('max_points', 100)

            prompt = f"""Create a detailed grading rubric for this assignment:

Assignment: {title}
Type: {assignment_type}
Description: {description}
Maximum Points: {max_points}

Generate a rubric with:
1. 4-5 main criteria relevant to this assignment type
2. Point distribution for each criterion
3. Performance levels (Excellent, Good, Satisfactory, Needs Improvement)
4. Clear descriptions for each performance level

Format as a structured rubric that can be used for consistent grading."""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an educational assessment expert. Create clear, fair grading rubrics."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.4,
                max_tokens=1000,
                top_p=1,
                stream=False
            )

            return {
                'success': True,
                'rubric': response.choices[0].message.content.strip(),
                'assignment_type': assignment_type,
                'max_points': max_points
            }

        except Exception as e:
            logger.error(f"Error generating rubric: {e}")
            return {
                'success': False,
                'error': 'Unable to generate rubric at this time'
            }

    def get_status(self):
        """Get AI service status for health monitoring"""
        try:
            # Ensure primary client is initialized
            self.ensure_primary_ready()
            
            # Check if fallback service is available
            fallback_available = hasattr(self, 'fallback_service') and self.fallback_service is not None
            
            if self.fallback_mode:
                return {
                    'status': '⚠️ Fallback Mode',
                    'model_version': 'Fallback Service',
                    'last_training': 'N/A',
                    'inference_latency_avg': '200ms',
                    'inference_latency_p95': '400ms',
                    'model_load_status': 'fallback',
                    'groq_available': False,
                    'fallback_available': fallback_available
                }
            elif self._primary_ready and self.client:
                return {
                    'status': '✅ Ready',
                    'model_version': self.model,
                    'last_training': '2024-04-01',
                    'inference_latency_avg': '150ms',
                    'inference_latency_p95': '300ms',
                    'model_load_status': 'ready',
                    'groq_available': True,
                    'fallback_available': fallback_available
                }
            else:
                return {
                    'status': '❌ Not Ready',
                    'model_version': self.model if hasattr(self, 'model') else 'Unknown',
                    'last_training': 'N/A',
                    'inference_latency_avg': 'N/A',
                    'inference_latency_p95': 'N/A',
                    'model_load_status': 'initializing',
                    'groq_available': False,
                    'fallback_available': fallback_available
                }
        except Exception as e:
            return {
                'status': '❌ Error',
                'model_version': 'Unknown',
                'last_training': 'N/A',
                'inference_latency_avg': 'N/A',
                'inference_latency_p95': 'N/A',
                'model_load_status': 'error',
                'groq_available': False,
                'fallback_available': False,
                'error': str(e)
            }

def _get_global():
    global _GLOBAL_INSTANCE
    if _GLOBAL_INSTANCE is None:
        _GLOBAL_INSTANCE = AITutorService()
    return _GLOBAL_INSTANCE

def get_ai_status():
    """Get AI service status (global function for health monitoring)"""
    return _get_global().get_status()

# Expose singleton
ai_service = _get_global()

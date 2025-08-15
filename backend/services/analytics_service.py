w"""
Analytics Service for AI Tutor Platform
Comprehensive learning analytics and performance tracking
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from services.database import db_service
from services.cache_service import cache_service, cached, monitor_performance

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Advanced analytics service for learning platform"""
    
    def __init__(self):
        """Initialize analytics service"""
        self.db = db_service
        self.cache = cache_service
        logger.info("Analytics service initialized")
    
    @cached(ttl=600, key_prefix="analytics")
    @monitor_performance
    def get_dashboard_data(self, user_id: str = None, role: str = "admin") -> Dict[str, Any]:
        """
        Get comprehensive dashboard analytics
        Cached for 10 minutes for performance
        """
        try:
            dashboard_data = {
                "overview": self._get_overview_metrics(),
                "user_engagement": self._get_user_engagement_metrics(),
                "course_performance": self._get_course_performance_metrics(),
                "ai_usage": self._get_ai_usage_metrics(),
                "recent_activity": self._get_recent_activity(),
                "performance_trends": self._get_performance_trends(),
                "system_health": self._get_system_health_metrics()
            }
            
            # Filter data based on user role
            if role == "instructor":
                dashboard_data = self._filter_instructor_data(dashboard_data, user_id)
            elif role == "student":
                dashboard_data = self._filter_student_data(dashboard_data, user_id)
            
            logger.info(f"Dashboard data generated for role: {role}")
            return dashboard_data
            
        except Exception as e:
            logger.error(f"Dashboard data generation error: {str(e)}")
            return self._get_fallback_dashboard_data()
    
    def _get_overview_metrics(self) -> Dict[str, Any]:
        """Get high-level platform metrics"""
        try:
            # Use database service to get counts
            total_users = len(self.db.get_all_users())
            total_courses = len(self.db.get_courses())
            total_assignments = len(self.db.get_assignments())
            
            # Calculate active users (users active in last 7 days)
            active_users = self._count_active_users(days=7)
            
            # Calculate completion rates
            completion_rate = self._calculate_overall_completion_rate()
            
            return {
                "total_users": total_users,
                "total_courses": total_courses,
                "total_assignments": total_assignments,
                "active_users": active_users,
                "completion_rate": completion_rate,
                "growth_rate": self._calculate_growth_rate()
            }
        except Exception as e:
            logger.error(f"Overview metrics error: {str(e)}")
            return {
                "total_users": 0,
                "total_courses": 0,
                "total_assignments": 0,
                "active_users": 0,
                "completion_rate": 0.0,
                "growth_rate": 0.0
            }
    
    def _get_user_engagement_metrics(self) -> Dict[str, Any]:
        """Get user engagement analytics"""
        try:
            # Calculate daily/weekly/monthly active users
            daily_active = self._count_active_users(days=1)
            weekly_active = self._count_active_users(days=7)
            monthly_active = self._count_active_users(days=30)
            
            # Session duration analytics
            avg_session_duration = self._calculate_avg_session_duration()
            
            # Feature usage
            feature_usage = self._get_feature_usage_stats()
            
            return {
                "daily_active_users": daily_active,
                "weekly_active_users": weekly_active,
                "monthly_active_users": monthly_active,
                "avg_session_duration": avg_session_duration,
                "feature_usage": feature_usage,
                "retention_rate": self._calculate_retention_rate()
            }
        except Exception as e:
            logger.error(f"User engagement metrics error: {str(e)}")
            return {
                "daily_active_users": 0,
                "weekly_active_users": 0,
                "monthly_active_users": 0,
                "avg_session_duration": 0,
                "feature_usage": {},
                "retention_rate": 0.0
            }
    
    def _get_course_performance_metrics(self) -> Dict[str, Any]:
        """Get course performance analytics"""
        try:
            courses = self.db.get_courses()
            course_stats = []
            
            for course in courses:
                course_id = course.get('id')
                enrollments = self.db.get_course_enrollments(course_id)
                
                # Calculate course metrics
                enrollment_count = len(enrollments)
                completion_count = len([e for e in enrollments if e.get('completed_at')])
                completion_rate = (completion_count / enrollment_count * 100) if enrollment_count > 0 else 0
                
                # Average progress
                avg_progress = sum([e.get('progress_percentage', 0) for e in enrollments]) / enrollment_count if enrollment_count > 0 else 0
                
                course_stats.append({
                    "course_id": course_id,
                    "course_title": course.get('title'),
                    "enrollment_count": enrollment_count,
                    "completion_rate": round(completion_rate, 2),
                    "avg_progress": round(avg_progress, 2),
                    "rating": course.get('rating', 0)
                })
            
            # Sort by enrollment count
            course_stats.sort(key=lambda x: x['enrollment_count'], reverse=True)
            
            return {
                "top_courses": course_stats[:10],
                "total_enrollments": sum([c['enrollment_count'] for c in course_stats]),
                "avg_completion_rate": round(sum([c['completion_rate'] for c in course_stats]) / len(course_stats), 2) if course_stats else 0
            }
            
        except Exception as e:
            logger.error(f"Course performance metrics error: {str(e)}")
            return {
                "top_courses": [],
                "total_enrollments": 0,
                "avg_completion_rate": 0.0
            }
    
    def _get_ai_usage_metrics(self) -> Dict[str, Any]:
        """Get AI tutoring usage analytics"""
        try:
            # This would require implementing chat/session tracking
            # For now, return placeholder data
            return {
                "total_conversations": 0,
                "avg_messages_per_session": 0,
                "most_popular_subjects": [],
                "ai_response_time": 0,
                "user_satisfaction": 0
            }
        except Exception as e:
            logger.error(f"AI usage metrics error: {str(e)}")
            return {
                "total_conversations": 0,
                "avg_messages_per_session": 0,
                "most_popular_subjects": [],
                "ai_response_time": 0,
                "user_satisfaction": 0
            }
    
    def _get_recent_activity(self) -> List[Dict[str, Any]]:
        """Get recent platform activity"""
        try:
            # Placeholder for recent activity feed
            return []
        except Exception as e:
            logger.error(f"Recent activity error: {str(e)}")
            return []
    
    def _get_performance_trends(self) -> Dict[str, Any]:
        """Get performance trend data"""
        try:
            # Calculate trends over last 30 days
            return {
                "user_growth": self._calculate_user_growth_trend(),
                "engagement_trend": self._calculate_engagement_trend(),
                "completion_trend": self._calculate_completion_trend()
            }
        except Exception as e:
            logger.error(f"Performance trends error: {str(e)}")
            return {
                "user_growth": [],
                "engagement_trend": [],
                "completion_trend": []
            }
    
    def _get_system_health_metrics(self) -> Dict[str, Any]:
        """Get system health and performance metrics"""
        try:
            # Get cache statistics
            cache_stats = self.cache.get_stats() if self.cache.is_available() else {"status": "disabled"}
            
            # Database health (basic check)
            db_healthy = self.db.health_check().get('status') == 'healthy'
            
            return {
                "database_status": "healthy" if db_healthy else "unhealthy",
                "cache_status": cache_stats.get("status", "unknown"),
                "cache_hit_rate": cache_stats.get("hit_rate", 0),
                "response_time": self._get_avg_response_time(),
                "error_rate": self._get_error_rate()
            }
        except Exception as e:
            logger.error(f"System health metrics error: {str(e)}")
            return {
                "database_status": "unknown",
                "cache_status": "unknown",
                "cache_hit_rate": 0,
                "response_time": 0,
                "error_rate": 0
            }
    
    # Helper methods
    def _count_active_users(self, days: int) -> int:
        """Count active users in the last N days"""
        try:
            # This would require activity tracking in the database
            # For now, return a placeholder calculation
            all_users = self.db.get_all_users()
            return len(all_users) // 2  # Placeholder: assume 50% are active
        except Exception:
            return 0
    
    def _calculate_overall_completion_rate(self) -> float:
        """Calculate overall platform completion rate"""
        try:
            # Placeholder calculation
            return 75.5  # Example completion rate
        except Exception:
            return 0.0
    
    def _calculate_growth_rate(self) -> float:
        """Calculate user growth rate"""
        try:
            # Placeholder calculation
            return 12.3  # Example growth rate
        except Exception:
            return 0.0
    
    def _calculate_avg_session_duration(self) -> int:
        """Calculate average session duration in minutes"""
        try:
            # Placeholder calculation
            return 45  # Example: 45 minutes average
        except Exception:
            return 0
    
    def _get_feature_usage_stats(self) -> Dict[str, int]:
        """Get feature usage statistics"""
        try:
            return {
                "ai_tutor": 0,
                "assignments": 0,
                "courses": 0,
                "discussions": 0
            }
        except Exception:
            return {}
    
    def _calculate_retention_rate(self) -> float:
        """Calculate user retention rate"""
        try:
            return 85.2  # Placeholder
        except Exception:
            return 0.0
    
    def _calculate_user_growth_trend(self) -> List[Dict[str, Any]]:
        """Calculate user growth trend data"""
        try:
            # Generate placeholder trend data for last 30 days
            trend_data = []
            base_date = datetime.now() - timedelta(days=30)
            
            for i in range(30):
                date = base_date + timedelta(days=i)
                trend_data.append({
                    "date": date.strftime("%Y-%m-%d"),
                    "new_users": i % 5 + 1,  # Placeholder data
                    "total_users": 100 + i * 2  # Placeholder data
                })
            
            return trend_data
        except Exception:
            return []
    
    def _calculate_engagement_trend(self) -> List[Dict[str, Any]]:
        """Calculate engagement trend data"""
        try:
            # Placeholder engagement trend
            return []
        except Exception:
            return []
    
    def _calculate_completion_trend(self) -> List[Dict[str, Any]]:
        """Calculate completion trend data"""
        try:
            # Placeholder completion trend
            return []
        except Exception:
            return []
    
    def _get_avg_response_time(self) -> float:
        """Get average API response time"""
        try:
            # Get from cache performance metrics
            return 150.0  # Placeholder: 150ms
        except Exception:
            return 0.0
    
    def _get_error_rate(self) -> float:
        """Get system error rate"""
        try:
            return 0.5  # Placeholder: 0.5% error rate
        except Exception:
            return 0.0
    
    def _filter_instructor_data(self, data: Dict[str, Any], instructor_id: str) -> Dict[str, Any]:
        """Filter dashboard data for instructor view"""
        # Filter to show only instructor's courses and students
        return data  # Placeholder implementation
    
    def _filter_student_data(self, data: Dict[str, Any], student_id: str) -> Dict[str, Any]:
        """Filter dashboard data for student view"""
        # Filter to show only student's progress and courses
        return data  # Placeholder implementation
    
    def _get_fallback_dashboard_data(self) -> Dict[str, Any]:
        """Fallback dashboard data when analytics fail"""
        return {
            "overview": {
                "total_users": 0,
                "total_courses": 0,
                "total_assignments": 0,
                "active_users": 0,
                "completion_rate": 0.0,
                "growth_rate": 0.0
            },
            "user_engagement": {
                "daily_active_users": 0,
                "weekly_active_users": 0,
                "monthly_active_users": 0,
                "avg_session_duration": 0,
                "feature_usage": {},
                "retention_rate": 0.0
            },
            "course_performance": {
                "top_courses": [],
                "total_enrollments": 0,
                "avg_completion_rate": 0.0
            },
            "ai_usage": {
                "total_conversations": 0,
                "avg_messages_per_session": 0,
                "most_popular_subjects": [],
                "ai_response_time": 0,
                "user_satisfaction": 0
            },
            "recent_activity": [],
            "performance_trends": {
                "user_growth": [],
                "engagement_trend": [],
                "completion_trend": []
            },
            "system_health": {
                "database_status": "unknown",
                "cache_status": "unknown",
                "cache_hit_rate": 0,
                "response_time": 0,
                "error_rate": 0
            }
        }

# Global analytics service instance
analytics_service = AnalyticsService()

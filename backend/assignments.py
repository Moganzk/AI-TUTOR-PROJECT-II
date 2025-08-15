from flask import request, jsonify
from database import db
from middleware import require_auth, require_role, validate_json
from config import Config
import logging

logger = logging.getLogger(__name__)

def register_assignments_routes(app):
    @app.route('/api/assignments', methods=['GET'])
    @require_auth
    def get_user_assignments():
        try:
            current_user = request.user
            
            # Students see their enrolled course assignments
            if current_user['role'] == 'student':
                enrollments = db.get_student_enrollments(current_user['id'])
                if not enrollments:
                    return jsonify({'assignments': []}), 200
                    
                all_assignments = []
                for enrollment in enrollments:
                    course_assignments = db.get_assignments_by_course(enrollment['course_id'], include_unpublished=False)
                    for assignment in course_assignments:
                        # Add course info to each assignment
                        course = db.get_course_by_id(enrollment['course_id'])
                        if course:
                            assignment['course_name'] = course.get('name', course.get('title', 'Unknown Course'))
                            assignment['instructor_name'] = course.get('instructor_name', 'Unknown')
                        all_assignments.append(assignment)
                
                return jsonify({'assignments': all_assignments}), 200
            else:
                # Admin/staff see all assignments with pagination
                try:
                    page = int(request.args.get('page', 1))
                    limit = int(request.args.get('limit', 50))
                except Exception:
                    page, limit = 1, 50
                
                try:
                    all_assignments = db.get_all_assignments(page=page, limit=limit)
                except TypeError:
                    # Fallback if pagination not supported
                    all_assignments = db.get_all_assignments()
                
                return jsonify({
                    'assignments': all_assignments,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'count': len(all_assignments)
                    }
                }), 200
                
        except Exception as e:
            logger.error(f"Error getting user assignments: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/assignments', methods=['POST'])
    @require_auth
    def create_assignment():
        try:
            data = request.get_json()
            current_user = request.user
            
            title = data.get('title', '').strip()
            course_id = data.get('course_id')
            
            logger.debug("Assignment creation request", extra={"user_id": current_user['id'], "course_id": course_id})
            
            # Validate required fields
            if not title:
                return jsonify({'error': 'Assignment title is required'}), 400
            
            if course_id and not isinstance(course_id, str):
                return jsonify({'error': 'Invalid course ID format'}), 400
            
            # Check permissions
            if current_user['role'] not in ['admin', 'staff']:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            # Verify course exists if provided
            if course_id:
                try:
                    course = db.get_course_by_id(course_id)
                    if not course:
                        logger.warning(f"Course not found with ID: {course_id}")
                        all_courses = db.get_courses()
                        logger.debug(f"Available courses: {[c.get('id') for c in all_courses]}")
                        return jsonify({'error': 'Course not found'}), 404
                    else:
                        logger.debug(f"Course found: {course.get('title', course.get('name', 'Unknown'))}")
                except Exception as course_error:
                    logger.error(f"Error checking course: {course_error}")
                    return jsonify({'error': 'Error validating course'}), 500
            
            # Parse due date
            due_date = data.get('due_date')
            if due_date:
                try:
                    from datetime import datetime
                    due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
                except (ValueError, AttributeError):
                    return jsonify({'error': 'Invalid due date format'}), 400
            
            # Parse max points
            try:
                max_points = data.get('max_points', 100)
                if max_points is None:
                    max_points = 100
                points_possible = int(max_points)
            except (ValueError, TypeError):
                points_possible = 100
            
            logger.info(f"Creating assignment with course_id: {course_id}, title: {title}")
            
            # Convert frontend status to backend status
            frontend_status = data.get('status', 'draft')
            if frontend_status == 'active':
                db_status = 'published'
                is_published = True
            elif frontend_status == 'published':
                db_status = 'published'
                is_published = True
            elif frontend_status == 'draft':
                db_status = 'draft'
                is_published = False
            else:
                db_status = 'draft'
                is_published = False
            
            # Create assignment
            assignment = db.create_assignment(
                course_id=course_id,
                title=title,
                description=data.get('description', ''),
                instructions=data.get('instructions', ''),
                assignment_type=data.get('assignment_type', 'homework'),
                due_date=due_date,
                points_possible=points_possible,
                is_published=is_published,
                created_by=current_user['id'],
                status=db_status
            )
            
            if assignment:
                logger.info(f"Assignment created successfully: {assignment.get('id') if isinstance(assignment, dict) else assignment}")
                return jsonify({
                    'success': True,
                    'assignment': assignment,
                    'message': 'Assignment created successfully'
                }), 201
            else:
                logger.error("Failed to create assignment - db.create_assignment returned None")
                return jsonify({'error': 'Failed to create assignment'}), 500
                
        except Exception as e:
            logger.exception(f"Error creating assignment: {e}")
            return jsonify({
                'error': 'Failed to create assignment',
                'details': str(e) if Config.DEBUG else 'Please try again'
            }), 500

    @app.route('/api/courses/<course_id>/assignments', methods=['GET'])
    @require_auth
    def get_course_assignments(course_id):
        """Get all assignments for a specific course"""
        try:
            current_user = request.user
            
            # Verify course exists
            course = db.get_course_by_id(course_id)
            if not course:
                return jsonify({'error': 'Course not found'}), 404
            
            # Get assignments
            assignments = db.get_assignments_by_course(course_id, include_unpublished=False)
            
            # Check student enrollment
            if current_user['role'] == 'student':
                is_enrolled = db.is_student_enrolled(course_id, current_user['id'])
                if not is_enrolled:
                    return jsonify({'error': 'You must be enrolled in this course to view assignments'}), 403
            
            # Add course info to assignments
            for assignment in assignments:
                assignment['course_name'] = course.get('name', course.get('title', 'Unknown Course'))
                assignment['instructor_name'] = course.get('instructor_name', 'Unknown')
            
            return jsonify({
                'success': True,
                'assignments': assignments,
                'course': {
                    'id': course.get('id'),
                    'title': course.get('title'),
                    'name': course.get('name'),
                    'subject': course.get('subject')
                }
            }), 200
            
        except Exception as e:
            logger.error(f"Error getting course assignments: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/assignments/<assignment_id>', methods=['GET'])
    @require_auth
    def get_assignment(assignment_id):
        """Get assignment details"""
        try:
            current_user = request.user
            
            # Get assignment
            assignment = db.get_assignment_by_id(assignment_id)
            if not assignment:
                return jsonify({'error': 'Assignment not found'}), 404
            
            # Check student access
            if current_user['role'] == 'student':
                enrollment = db.get_student_enrollment(current_user['id'], assignment['course_id'])
                if not enrollment:
                    return jsonify({'error': 'Not enrolled in this course'}), 403
                
                if not assignment.get('is_published'):
                    return jsonify({'error': 'Assignment not available'}), 403
            
            return jsonify({'success': True, 'assignment': assignment}), 200
            
        except Exception as e:
            logger.error(f"Error getting assignment: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/assignments/<assignment_id>', methods=['PUT', 'PATCH'])
    @require_auth
    def update_assignment(assignment_id):
        """Update assignment"""
        try:
            current_user = request.user
            
            # Check permissions
            if current_user['role'] not in ['admin', 'staff']:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            data = request.get_json()
            
            # Update assignment
            assignment = db.update_assignment(assignment_id, **data)
            
            if assignment:
                return jsonify({
                    'success': True,
                    'assignment': assignment,
                    'message': 'Assignment updated successfully'
                }), 200
            else:
                return jsonify({'error': 'Assignment not found'}), 404
                
        except Exception as e:
            logger.error(f"Error updating assignment: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/assignments/<assignment_id>', methods=['DELETE'])
    @require_auth
    @require_role(['admin', 'staff'])
    def delete_assignment(assignment_id):
        """Delete assignment"""
        try:
            current_user = request.user
            
            # Double-check permissions
            if current_user['role'] not in ['admin', 'staff']:
                return jsonify({'error': 'Insufficient permissions'}), 403
            
            # Delete assignment
            success = db.delete_assignment(assignment_id)
            
            if success:
                return jsonify({
                    'success': True,
                    'message': 'Assignment deleted successfully'
                }), 200
            else:
                return jsonify({'error': 'Assignment not found'}), 404
                
        except Exception as e:
            logger.error(f"Error deleting assignment: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/assignments/<assignment_id>/submit', methods=['POST'])
    @require_auth
    def submit_assignment(assignment_id):
        """Submit assignment"""
        try:
            current_user = request.user
            
            # Only students can submit
            if current_user['role'] != 'student':
                return jsonify({'error': 'Only students can submit assignments'}), 403
            
            data = request.get_json()
            content = data.get('content')
            file_urls = data.get('file_urls', [])
            attempt_number = data.get('attempt_number', 1)
            
            # Verify assignment exists
            assignment = db.get_assignment_by_id(assignment_id)
            if not assignment:
                return jsonify({'error': 'Assignment not found'}), 404
            
            # Check enrollment
            enrollment = db.get_student_enrollment(current_user['id'], assignment['course_id'])
            if not enrollment:
                return jsonify({'error': 'Not enrolled in this course'}), 403
            
            # Submit assignment
            submission = db.submit_assignment(
                assignment_id=assignment_id,
                student_id=current_user['id'],
                content=content,
                file_urls=file_urls,
                attempt_number=attempt_number
            )
            
            if submission:
                return jsonify({
                    'success': True,
                    'submission': submission,
                    'message': 'Assignment submitted successfully'
                }), 201
            else:
                return jsonify({'error': 'Failed to submit assignment'}), 500
                
        except Exception as e:
            logger.error(f"Error submitting assignment: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/submissions/<submission_id>/grade', methods=['GET'])
    @require_auth
    def get_submission_grade(submission_id):
        """Get grade for a submission"""
        try:
            grade = db.get_submission_grade(submission_id)
            
            if grade:
                return jsonify({'success': True, 'grade': grade}), 200
            else:
                return jsonify({'error': 'Grade not found'}), 404
                
        except Exception as e:
            logger.error(f"Error getting submission grade: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/assignments/<assignment_id>/submissions', methods=['GET'])
    @require_auth
    def get_assignment_submissions(assignment_id):
        """Get all submissions for an assignment (for the current user if student)"""
        try:
            current_user = request.user
            
            # Verify assignment exists
            assignment = db.get_assignment_by_id(assignment_id)
            if not assignment:
                return jsonify({'error': 'Assignment not found'}), 404
            
            # Students only see their own submissions
            if current_user['role'] == 'student':
                submissions = db.get_student_submissions(current_user['id'], assignment['course_id'])
                submissions = [s for s in submissions if s.get('assignment_id') == assignment_id]
            else:
                # Admin/staff see all submissions for this assignment
                submissions = db.get_assignment_submissions(assignment_id)
            
            return jsonify({'success': True, 'submissions': submissions}), 200
            
        except Exception as e:
            logger.error(f"Error getting assignment submissions: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/submissions/<submission_id>/ai-grade', methods=['POST'])
    @require_auth
    @require_role(['admin', 'staff'])
    def ai_grade_submission(submission_id):
        """AI-powered automatic grading (admin/staff only)"""
        try:
            current_user = request.user
            
            # Get submission
            submission = db.get_submission_by_id(submission_id)
            if not submission:
                return jsonify({'error': 'Submission not found'}), 404
            
            # Get assignment
            assignment = db.get_assignment_by_id(submission['assignment_id'])
            if not assignment:
                return jsonify({'error': 'Assignment not found'}), 404
            
            # Check if submission has content
            submission_content = submission.get('content', '')
            if not submission_content:
                return jsonify({'error': 'No content to grade'}), 400
            
            # Use AI grading service
            import ai_service
            
            grading_result = ai_service.grade_assignment_automatically(
                assignment_data=assignment,
                submission_content=submission_content,
                rubric=request.get_json().get('rubric') if request.get_json() else None
            )
            
            if not grading_result.get('success'):
                return jsonify({
                    'error': grading_result.get('error', 'AI grading failed'),
                    'message': grading_result.get('message', 'Please try manual grading')
                }), 500
            
            # Save the grade
            grade = db.grade_submission(
                submission_id=submission_id,
                grader_id=current_user['id'],
                points_earned=grading_result['points_earned'],
                feedback=grading_result['feedback'],
                rubric_scores={'ai_confidence': grading_result.get('confidence_score', 0.85)},
                is_final=False  # AI grades are not final by default
            )
            
            if grade:
                return jsonify({
                    'success': True,
                    'grade': grade,
                    'ai_analysis': grading_result,
                    'message': 'Assignment graded successfully using AI'
                }), 201
            else:
                return jsonify({'error': 'Failed to save grade'}), 500
                
        except Exception as e:
            logger.error(f"Error in AI grading: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    @app.route('/api/assignments/<assignment_id>/generate-rubric', methods=['POST'])
    @require_auth
    @require_role(['admin', 'staff'])
    def generate_assignment_rubric(assignment_id):
        """Generate AI-powered grading rubric for assignment"""
        try:
            # Get assignment
            assignment = db.get_assignment_by_id(assignment_id)
            if not assignment:
                return jsonify({'error': 'Assignment not found'}), 404
            
            # Use AI service to generate rubric
            import ai_service
            
            rubric_result = ai_service.generate_assignment_rubric(assignment)
            
            if rubric_result.get('success'):
                return jsonify({
                    'success': True,
                    'rubric': rubric_result['rubric'],
                    'assignment_type': rubric_result['assignment_type'],
                    'max_points': rubric_result['max_points']
                }), 200
            else:
                return jsonify({
                    'error': rubric_result.get('error', 'Failed to generate rubric')
                }), 500
                
        except Exception as e:
            logger.error(f"Error generating rubric: {e}")
            return jsonify({'error': 'Internal server error'}), 500

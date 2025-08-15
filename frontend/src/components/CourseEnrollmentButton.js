import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { UserPlus, UserMinus, Loader } from 'lucide-react';
import apiService from '../services/api';

const CourseEnrollmentButton = ({ course, onEnrollmentChange }) => {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  useEffect(() => {
    checkEnrollmentStatus();
  }, [course.id, user]);

  const checkEnrollmentStatus = async () => {
    if (!user || user.role !== 'student') {
      setCheckingEnrollment(false);
      return;
    }

    try {
      const { data } = await apiService.student.enrollments(user.id);
      const enrollment = data.enrollments?.find(e => e.course_id === course.id);
      setIsEnrolled(!!enrollment);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleEnrollment = async () => {
    if (!user || user.role !== 'student') {
      toast.error('Only students can enroll in courses');
      return;
    }

    setLoading(true);
    try {
      if (isEnrolled) {
        await apiService.courses.unenroll(course.id);
        setIsEnrolled(false);
        toast.success('Unenrolled successfully');
        onEnrollmentChange && onEnrollmentChange(course.id, false);
      } else {
        await apiService.courses.enroll(course.id);
        setIsEnrolled(true);
        toast.success('Enrolled successfully');
        onEnrollmentChange && onEnrollmentChange(course.id, true);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (checkingEnrollment) {
    return (
      <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
    );
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <button
      onClick={handleEnrollment}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isEnrolled
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : isEnrolled ? (
        <>
          <UserMinus className="h-4 w-4" />
          <span>Unenroll</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Enroll</span>
        </>
      )}
    </button>
  );
};

export default CourseEnrollmentButton;

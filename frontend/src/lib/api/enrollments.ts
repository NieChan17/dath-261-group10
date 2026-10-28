import { apiClient } from '../api';
import type {
  CourseEnrollmentStatus,
  CourseStudentEnrollment,
  EnrollmentProgressResponse,
  UserEnrolledCourse,
} from '@/types/enrollment';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Đăng ký một khóa học đã xuất bản
 */
export async function enrollCourse(courseId: string): Promise<ApiResponse<any>> {
  return apiClient<ApiResponse<any>>(`/v1/courses/${courseId}/enroll`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Lấy danh sách khóa học học viên hiện tại đã đăng ký kèm tiến độ
 */
export async function getMyEnrollments(): Promise<ApiResponse<UserEnrolledCourse[]>> {
  return apiClient<ApiResponse<UserEnrolledCourse[]>>('/v1/enrollments/me', {
    method: 'GET',
    credentials: 'include',
  });
}

/**
 * Kiểm tra xem học viên hiện tại đã đăng ký khóa học này chưa
 */
export async function checkCourseEnrollment(courseId: string): Promise<ApiResponse<CourseEnrollmentStatus['data']> & { isEnrolled: boolean }> {
  return apiClient<ApiResponse<CourseEnrollmentStatus['data']> & { isEnrolled: boolean }>(
    `/v1/courses/${courseId}/enrollment`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );
}

/**
 * Lấy tiến độ học tập chi tiết của khóa học thông qua courseId
 */
export async function getCourseProgress(courseId: string): Promise<ApiResponse<EnrollmentProgressResponse>> {
  return apiClient<ApiResponse<EnrollmentProgressResponse>>(
    `/v1/courses/${courseId}/progress`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );
}

/**
 * Lấy tiến độ học tập chi tiết thông qua enrollmentId
 */
export async function getEnrollmentProgress(enrollmentId: string): Promise<ApiResponse<EnrollmentProgressResponse>> {
  return apiClient<ApiResponse<EnrollmentProgressResponse>>(
    `/v1/enrollments/${enrollmentId}/progress`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );
}

/**
 * Cập nhật vị trí playback và/hoặc trạng thái hoàn thành của một bài học
 */
export async function updateLessonProgress(
  enrollmentId: string,
  lessonId: string,
  payload: { isCompleted?: boolean; lastPositionSeconds?: number },
): Promise<ApiResponse<any>> {
  return apiClient<ApiResponse<any>>(
    `/v1/enrollments/${enrollmentId}/lessons/${lessonId}/progress`,
    {
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify(payload),
    },
  );
}

/**
 * Hủy đăng ký một khóa học
 */
export async function cancelEnrollment(enrollmentId: string): Promise<ApiResponse<any>> {
  return apiClient<ApiResponse<any>>(`/v1/enrollments/${enrollmentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

/**
 * Dành cho Giảng viên / Quản trị viên: Lấy danh sách học viên đăng ký khóa học
 */
export async function getCourseStudents(courseId: string): Promise<ApiResponse<CourseStudentEnrollment[]>> {
  return apiClient<ApiResponse<CourseStudentEnrollment[]>>(
    `/v1/courses/${courseId}/enrollments`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );
}

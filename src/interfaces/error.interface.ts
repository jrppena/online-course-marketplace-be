/**
 * 표준 에러 응답 인터페이스
 * online-course-marketplace-fe의 axios 인터셉터가 `message`를 최상위에서 읽으므로
 * 중첩 없는 flat 형태를 유지한다 (FE: src/lib/api-client.ts)
 */
export interface StandardErrorResponse {
  message: string;
  details?: unknown;
}

/**
 * HTTP 상태 코드별 에러 메시지 매핑
 */
export const HTTP_ERROR_MESSAGES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
} as const;

/**
 * 검증 에러 세부 정보
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: unknown;
}

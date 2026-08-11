/**
 * Standardized API Response formatter
 */
export class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Response message
   * @param {*} data - Response data payload
   */
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null && data !== undefined) {
      this.data = data;
    }
  }

  /**
   * Send JSON response to Express response object
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json(this);
  }

  static success(res, message = 'Success', data = null, statusCode = 200) {
    return new ApiResponse(statusCode, message, data).send(res);
  }

  static created(res, message = 'Resource created successfully', data = null) {
    return new ApiResponse(201, message, data).send(res);
  }
}

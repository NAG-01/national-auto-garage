export class ApiResponse {
  constructor(statusCode, message = 'Success', data = null, meta = {}) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta && Object.keys(meta).length > 0) {
      this.meta = meta;
    }
  }

  static success(res, message = 'Success', data = null, statusCode = 200, meta = {}) {
    return res.status(statusCode).json(new ApiResponse(statusCode, message, data, meta));
  }

  static created(res, message = 'Resource created successfully', data = null, meta = {}) {
    return res.status(201).json(new ApiResponse(201, message, data, meta));
  }
}

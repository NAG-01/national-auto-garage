import { JobCardService } from '../services/jobCard.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class JobCardController {
  static async create(req, res, next) {
    try {
      const job = await JobCardService.createJob(req.body, req.user);
      return ApiResponse.created(res, 'Service job created successfully', job);
    } catch (err) {
      next(err);
    }
  }

  static async list(req, res, next) {
    try {
      const { search, status, serviceType, page, limit } = req.query;
      const result = await JobCardService.getJobs({
        search,
        status,
        serviceType,
        page: Number(page || 1),
        limit: Number(limit || 20),
      });
      return ApiResponse.success(res, 'Service jobs list retrieved', result.jobs, 200, {
        summary: result.summary,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const job = await JobCardService.getJobById(req.params.id);
      return ApiResponse.success(res, 'Service job details retrieved', job);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const job = await JobCardService.updateJob(req.params.id, req.body, req.user);
      return ApiResponse.success(res, 'Service job updated successfully', job);
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const job = await JobCardService.updateJobStatus(req.params.id, status, req.user);
      return ApiResponse.success(res, `Service job status updated to ${status}`, job);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      await JobCardService.deleteJobCard(req.params.id, req.user);
      return ApiResponse.success(res, 'Service job deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

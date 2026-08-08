import announcementService from '../services/announcement.service.js';
import responseHelper from '../utils/response.js';

class AnnouncementController {
  async createAnnouncement(req, res) {
    try {
      const announcement = await announcementService.createAnnouncement(req.body);
      return responseHelper.success(res, 201, 'Announcement created successfully', announcement);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to create announcement', error.message);
    }
  }

  async getAllAnnouncementsAdmin(req, res) {
    try {
      const announcements = await announcementService.getAllAnnouncementsAdmin();
      return responseHelper.success(res, 200, 'Announcements fetched successfully', announcements);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch announcements', error.message);
    }
  }

  async getActiveAnnouncements(req, res) {
    try {
      // Determine user role from authenticated user (student or teacher/admin)
      const userRole = req.user?.role || 'student';
      const announcements = await announcementService.getActiveAnnouncementsForUser(userRole);
      return responseHelper.success(res, 200, 'Active announcements fetched successfully', announcements);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to fetch announcements', error.message);
    }
  }

  async updateAnnouncement(req, res) {
    try {
      const announcement = await announcementService.updateAnnouncement(req.params.id, req.body);
      return responseHelper.success(res, 200, 'Announcement updated successfully', announcement);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to update announcement', error.message);
    }
  }

  async deleteAnnouncement(req, res) {
    try {
      const result = await announcementService.deleteAnnouncement(req.params.id);
      return responseHelper.success(res, 200, 'Announcement deleted successfully', result);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to delete announcement', error.message);
    }
  }

  async togglePublish(req, res) {
    try {
      const announcement = await announcementService.togglePublish(req.params.id);
      return responseHelper.success(res, 200, 'Publish status updated successfully', announcement);
    } catch (error) {
      return responseHelper.error(res, error.statusCode || 400, error.message || 'Failed to toggle publish status', error.message);
    }
  }
}

export default new AnnouncementController();

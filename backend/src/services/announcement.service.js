import Announcement from '../models/announcement.model.js';

class AnnouncementService {
  /**
   * Create a new announcement (Admin)
   */
  async createAnnouncement(data) {
    const { title, message, targetAudience, published, priority, expiryDate } = data;

    if (!title || !message) {
      const error = new Error('Title and message are required');
      error.statusCode = 400;
      throw error;
    }

    const announcement = await Announcement.create({
      title,
      message,
      targetAudience: targetAudience || 'All Users',
      published: published !== undefined ? published : true,
      priority: priority || 'Medium',
      expiryDate: expiryDate || null,
    });

    return announcement;
  }

  /**
   * Get all announcements for Admin view (includes unpublished)
   */
  async getAllAnnouncementsAdmin() {
    return await Announcement.find().sort({ createdAt: -1 });
  }

  /**
   * Get active published announcements for a specific user role (Student or Teacher)
   */
  async getActiveAnnouncementsForUser(userRole) {
    const now = new Date();
    const audienceFilter = ['All Users'];
    
    if (userRole === 'student') audienceFilter.push('Students');
    if (userRole === 'teacher' || userRole === 'admin') audienceFilter.push('Teachers');

    const query = {
      published: true,
      targetAudience: { $in: audienceFilter },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: now } }
      ]
    };

    return await Announcement.find(query).sort({ createdAt: -1 });
  }

  /**
   * Update an announcement (Admin)
   */
  async updateAnnouncement(id, updateData) {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      const error = new Error('Announcement not found');
      error.statusCode = 404;
      throw error;
    }

    const allowed = ['title', 'message', 'targetAudience', 'published', 'priority', 'expiryDate'];
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        announcement[key] = updateData[key];
      }
    }

    await announcement.save();
    return announcement;
  }

  /**
   * Delete an announcement (Admin)
   */
  async deleteAnnouncement(id) {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      const error = new Error('Announcement not found');
      error.statusCode = 404;
      throw error;
    }

    await announcement.deleteOne();
    return { id };
  }

  /**
   * Toggle published status of an announcement (Admin)
   */
  async togglePublish(id) {
    const announcement = await Announcement.findById(id);
    if (!announcement) {
      const error = new Error('Announcement not found');
      error.statusCode = 404;
      throw error;
    }

    announcement.published = !announcement.published;
    await announcement.save();
    return announcement;
  }
}

export default new AnnouncementService();

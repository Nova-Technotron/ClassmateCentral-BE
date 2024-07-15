import { describe, it, expect, vi, afterEach } from 'vitest';
import Announcement from '../../src/models/Announcement.js';
import { validateAnnouncement } from '../../src/validators/announcementValidtor.js';
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../src/controllers/announcementController.js';

vi.mock('../../src/models/Announcement.js');
vi.mock('../../src/validators/announcementValidtor.js');

describe('Announcement Controller', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createAnnouncement', () => {
    it('should create a new announcement and return 201 status', async () => {
      const req = {
        body: { title: 'New Announcement', content: 'Announcement content' },
        user: { id: 'user123' },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
        send: vi.fn(),
      };

      const mockAnnouncement = {
        save: vi.fn().mockResolvedValue({
        _id: 'announcement123',
        title: 'New Announcement',
        content: 'Announcement content',
        createdBy: 'user123',})
      };

      validateAnnouncement.mockReturnValue({ error: null });
      Announcement.mockImplementation(()=>mockAnnouncement);

      await createAnnouncement(req, res);

      expect(validateAnnouncement).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Announcement created successfully',
        announcement: mockAnnouncement,
      });
    });

    it('should return 400 if validation fails', async () => {
      const req = {
        body: { title: 'New Announcement', content: 'Announcement content' },
        user: { id: 'user123' },
      };
      const res = {
        status: vi.fn(() => res),
        send: vi.fn(),
      };

      validateAnnouncement.mockReturnValue({ error: { details: [{ message: 'Validation error' }] } });

      await createAnnouncement(req, res);

      expect(validateAnnouncement).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Validation error');
    });

    it('should return 500 if server error occurs', async () => {
      const req = {
        body: { title: 'New Announcement', content: 'Announcement content' },
        user: { id: 'user123' },
      };
     
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      validateAnnouncement.mockReturnValue({ error: null });

      const mockAnnouncement = {
        save: vi.fn().mockRejectedValue( Error("Server error")),
      };
      Announcement.mockImplementation(() => mockAnnouncement);

      await createAnnouncement(req, res);

      expect(validateAnnouncement).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('getAnnouncements', () => {
    it('should fetch all announcements and return 200 status', async () => {
      const req = {};
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockAnnouncements = [
        {
          _id: 'announcement123',
          title: 'New Announcement',
          content: 'Announcement content',
          createdBy: { _id: 'user123', username: 'testuser' },
        },
      ];
      const populateMock = vi.fn().mockResolvedValue(mockAnnouncements);
      Announcement.find.mockReturnValue({ populate: populateMock });

      

      await getAnnouncements(req, res);
      expect(Announcement.find).toHaveBeenCalledWith();
expect(populateMock).toBeCalledWith( 'createdBy', 'username')
      expect(res.json).toHaveBeenCalledWith(mockAnnouncements);
    });

    it('should return 500 if server error occurs', async () => {
      const req = {};
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      Announcement.find.mockReturnValue({
        populate: vi.fn().mockRejectedValue(new Error('Server error')),
      });

      await getAnnouncements(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('updateAnnouncement', () => {
    it('should update an announcement and return 200 status', async () => {
      const req = {
        params: { id: 'announcement123' },
        body: { title: 'Updated Announcement', content: 'Updated content' },
        user: { id: 'user123' },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockAnnouncement = {
        _id: 'announcement123',
        title: 'New Announcement',
        content: 'Announcement content',
        createdBy: 'user123',
        save: vi.fn().mockResolvedValue(true),
      };

      validateAnnouncement.mockReturnValue({ error: null });
      Announcement.findById.mockResolvedValue(mockAnnouncement);

      await updateAnnouncement(req, res);

      expect(validateAnnouncement).toHaveBeenCalledWith(req.body);
      expect(mockAnnouncement.save).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith({
        message: 'Announcement updated successfully',
        announcement: {
          ...mockAnnouncement,
          title: 'Updated Announcement',
          content: 'Updated content',
        },
      });
    });

    it('should return 404 if announcement not found', async () => {
      const req = { params: { id: 'announcement123' }, body: {}, user: { id: 'user123' } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      validateAnnouncement.mockReturnValue({ error: null });
      Announcement.findById.mockResolvedValue(null);

      await updateAnnouncement(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Announcement not found' });
    });

    it('should return 403 if user is not the creator of the announcement', async () => {
      const req = { params: { id: 'announcement123' }, body: {}, user: { id: 'user456' } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockAnnouncement = {
        _id: 'announcement123',
        createdBy: 'user123',
      };

      validateAnnouncement.mockReturnValue({ error: null });
      Announcement.findById.mockResolvedValue(mockAnnouncement);

      await updateAnnouncement(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to update this announcement' });
    });

    it('should return 500 if server error occurs', async () => {
      const req = { params: { id: 'announcement123' }, body: {}, user: { id: 'user123' } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      validateAnnouncement.mockReturnValue({ error: null });
      Announcement.findById.mockRejectedValue(new Error('Server error'));

      await updateAnnouncement(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe('deleteAnnouncement', () => {
    it('should delete an announcement and return 200 status', async () => {
      const req = { params: { id: 'announcement123' }, user: { id: 'user123', isAdmin: false } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockAnnouncement = {
        _id: 'announcement123',
        createdBy: 'user123',
        remove: vi.fn().mockResolvedValue({}),
      };

      Announcement.findById.mockResolvedValue(mockAnnouncement);
      Announcement.findByIdAndDelete.mockResolvedValue(mockAnnouncement);

      await deleteAnnouncement(req, res);
      expect(Announcement.findById).toHaveBeenCalledWith("announcement123");
      expect(Announcement.findByIdAndDelete).toHaveBeenCalledWith(
        "announcement123"
      );

      expect(res.json).toHaveBeenCalledWith({ message: 'Announcement deleted successfully' });
    });

    it('should return 404 if announcement not found', async () => {
      const req = { params: { id: 'announcement123' }, user: { id: 'user123', isAdmin: false } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      Announcement.findById.mockResolvedValue(null);

      await deleteAnnouncement(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Announcement not found' });
    });

    it('should return 403 if user is not the creator or an admin', async () => {
      const req = { params: { id: 'announcement123' }, user: { id: 'user456', isAdmin: false } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockAnnouncement = {
        _id: 'announcement123',
        createdBy: 'user123',
      };

      Announcement.findById.mockResolvedValue(mockAnnouncement);

      await deleteAnnouncement(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to delete this announcement' });
    });

    it('should return 500 if server error occurs', async () => {
      const req = { params: { id: 'announcement123' }, user: { id: 'user123', isAdmin: false } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      Announcement.findById.mockRejectedValue(new Error('Server error'));

      await deleteAnnouncement(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
});
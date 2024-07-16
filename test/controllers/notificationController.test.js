

import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
} from "vitest";
import mongoose from "mongoose";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  createNotification,
} from "../../src/controllers/notificationController";
import Notification from "../../src/models/Notification";

// Mock the Notification model
vi.mock("../../src/models/Notification");

describe("Notification Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        id: new mongoose.Types.ObjectId().toString(),
      },
      params: {
        id: new mongoose.Types.ObjectId().toString(),
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    vi.clearAllMocks();
  });
  describe("createNotification", () => {
    it("should create a new notification and return 201 status", async () => {
      const req = {
        body: {
          title: "New Notification",
          message: "This is a test notification",
        },
        user: {
          id: new mongoose.Types.ObjectId().toString(),
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      const mockNotificationInstance = {
        _id: new mongoose.Types.ObjectId().toString(),
        title: "New Notification",
        message: "This is a test notification",
        user: req.user.id,
        createdAt: new Date(),
        save: vi.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId().toString(),
          title: "New Notification",
          message: "This is a test notification",
          user: req.user.id,
          createdAt: new Date(),
        }),
      };

      Notification.mockImplementation(() => mockNotificationInstance);

      await createNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Notification created successfully",
        notification: mockNotificationInstance,
      });
    });

    it("should return 400 if title or message is missing", async () => {
      const req = {
        body: {
          message: "This is a test notification",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      await createNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Title and message are required",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        body: {
          title: "New Notification",
          message: "This is a test notification",
        },
        user: {
          id: new mongoose.Types.ObjectId().toString(),
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      Notification.mockImplementation(() => {
        throw new Error("Server error");
      });

      await createNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getNotifications", () => {
 
    it('should return notifications and 200 status', async () => {
      const req = {
          user: {
              id: new mongoose.Types.ObjectId().toString(),
          },
      };

      const res = {
          status: vi.fn().mockReturnThis(),
          json: vi.fn(),
      };

      const mockNotifications = [
          { _id: new mongoose.Types.ObjectId().toString(), title: 'Test Notification', message: 'This is a test', user: req.user.id, createdAt: new Date() }
      ];

      Notification.find.mockResolvedValue(mockNotifications);


      await getNotifications(req, res);

      expect(Notification.find).toHaveBeenCalledWith({ user: req.user.id });
      expect(Notification.find).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith(mockNotifications);
  });

  it('should return a message if no notifications are found', async () => {
    Notification.find.mockResolvedValue([]);

    await getNotifications(req, res);

    expect(Notification.find).toHaveBeenCalledWith({ user: req.user.id });
    expect(res.json).toHaveBeenCalledWith({ message: 'You have no notification' });
  });

    it("should return 500 status when there is a server error", async () => {
      const req = {
        user: {
          id: new mongoose.Types.ObjectId().toString(),
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      Notification.find.mockImplementation(() => {
        throw new Error("Server error");
      });

      await getNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("markNotificationAsRead", () => {
    it("should mark a notification as read successfully", async () => {
      const mockNotification = {
        _id: req.params.id,
        user: req.user.id,
        message: "Test notification",
        read: false,
        save: vi.fn().mockResolvedValue(),
      };

      Notification.findById.mockResolvedValue(mockNotification);

      await markNotificationAsRead(req, res);

      expect(Notification.findById).toHaveBeenCalledWith(req.params.id);
      expect(mockNotification.read).toBe(true);
      expect(mockNotification.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockNotification);
    });

    it("should return 404 if notification not found", async () => {
      Notification.findById.mockResolvedValue(null);

      await markNotificationAsRead(req, res);

      expect(Notification.findById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Notification not found",
      });
    });

    it("should handle server error", async () => {
      const errorMessage = "Server error";
      Notification.findById.mockRejectedValue(new Error(errorMessage));

      await markNotificationAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("deleteNotification", () => {
    it("should delete a notification successfully", async () => {
      const mockNotification = {
        _id: req.params.id,
        user: req.user.id,
        message: "Test notification",
      };

      Notification.findById.mockResolvedValue(mockNotification);

      await deleteNotification(req, res);

      expect(Notification.findById).toHaveBeenCalledWith(req.params.id);
      expect(res.json).toHaveBeenCalledWith({
        message: "Notification deleted successfully",
      });
    });

    it("should return 404 if notification not found", async () => {
      Notification.findById.mockResolvedValue(null);

      await deleteNotification(req, res);

      expect(Notification.findById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Notification not found",
      });
    });

    it("should handle server error", async () => {
      const errorMessage = "Server error";
      Notification.findById.mockRejectedValue(new Error(errorMessage));

      await deleteNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});

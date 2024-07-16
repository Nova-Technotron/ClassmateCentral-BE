import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
  vi,
} from "vitest";
import mongoose from "mongoose";
import User from "../../src/models/User.js";
import Message from "../../src/models/Message.js";
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  sendMessageToUser,
} from "../../src/controllers/userController.js";
vi.mock("../../src/models/User.js");
vi.mock("../../src/models/Message.js");

describe("User Controller Tests", () => {
  beforeAll(async () => {
    await mongoose.connect(import.meta.env.VITE_MONGODB_TEST, {});

    await User.deleteMany({});
  });

  afterAll(async () => {

    await mongoose.connection.close();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserProfile", () => {
    it("should fetch user profile and return 200 status", async () => {
      const req = { user: { id: "user123" } };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      const mockUser = {
        _id: "user123",
        username: "testuser",
        email: "testuser@example.com",
        select: vi.fn().mockResolvedValue({
          _id: "user123",
          username: "testuser",
          email: "testuser@example.com",
        }),
      };

      User.findById.mockReturnValue(mockUser);

      await getUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockUser.select).toHaveBeenCalledWith("-password");
      expect(res.json).toHaveBeenCalledWith({
        _id: "user123",
        username: "testuser",
        email: "testuser@example.com",
      });
    });

    it("should return 404 if user not found", async () => {
      const req = { user: { id: "user123" } };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      const mockUser = {
        select: vi.fn().mockResolvedValue(null),
      };

      User.findById.mockReturnValue(mockUser);

      await getUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(mockUser.select).toHaveBeenCalledWith("-password");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });
    it("should return 500 if server error occurs", async () => {
      const req = { user: { id: "user123" } };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.findById.mockImplementation(() => {
        throw new Error("Server error");
      });

      await getUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("updateUserProfile", () => {
    it("should update user profile and return 200 status", async () => {
      const req = {
        user: { id: "user123" },
        body: { username: "updateduser", email: "updateduser@example.com" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.findById.mockResolvedValue({
        _id: "user123",
        username: "testuser",
        email: "testuser@example.com",
        save: vi.fn().mockResolvedValue({
          _id: "user123",
          username: "updateduser",
          email: "updateduser@example.com",
        }),
      });

      await updateUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.json).toHaveBeenCalledWith({
        message: "User profile updated successfully",
      });
    });

    it("should return 404 if user not found", async () => {
      const req = {
        user: { id: "user123" },
        body: { username: "updateduser", email: "updateduser@example.com" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.findById.mockResolvedValue(null);

      await updateUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        user: { id: "user123" },
        body: { username: "updateduser", email: "updateduser@example.com" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.findById.mockRejectedValue(new Error("Server error"));

      await updateUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getUsers", () => {
    it("should fetch list of users and return 200 status", async () => {
      const req = {};
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      const mockUsers = [
        {
          _id: "user123",
          username: "testuser1",
          email: "testuser1@example.com",
        },
        {
          _id: "user456",
          username: "testuser2",
          email: "testuser2@example.com",
        },
      ];

      const selectMock = vi.fn().mockResolvedValue(mockUsers);
      User.find.mockReturnValue({ select: selectMock });

      await getUsers(req, res);

      expect(User.find).toHaveBeenCalledWith();
      expect(selectMock).toHaveBeenCalledWith("-password");
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it("should return 500 if server error occurs", async () => {
      const req = {};
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.find.mockImplementation(() => {
        throw new Error("Server error");
      });

      await getUsers(req, res);

      expect(User.find).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("deleteUser", () => {
    it("should delete user and return 200 status", async () => {
      const req = {
        params: { id: "user123" },
        user: { id: "user123", isAdmin: true },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.findById.mockResolvedValue({
        _id: "user123",
        remove: vi.fn().mockResolvedValue({}),
      });

      await deleteUser(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    it("should return 404 if user not found", async () => {
      const req = {
        params: { id: "user123" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.findById.mockResolvedValue(null);

      await deleteUser(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 403 if user is not authorized", async () => {
      const req = {
        params: { id: "user123" },
        user: { id: "anotherUser", isAdmin: false },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.findById.mockResolvedValue({
        _id: "user123",
      });

      await deleteUser(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized to delete this user",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        params: { id: "user123" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.findById.mockImplementation(() => {
        throw new Error("Server error");
      });

      await deleteUser(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("sendMessageToUser", () => {
    it("should send a message and return 201 status", async () => {
      const req = {
        params: { id: "user123" },
        user: { id: "user456" },
        body: { content: "Hello, world!" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.findById.mockResolvedValue({
        _id: "user123",
      });

      Message.create.mockResolvedValue({
        sender: "user456",
        recipient: "user123",
        content: "Hello, world!",
      });

      await sendMessageToUser(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(Message.create).toHaveBeenCalledWith({
        sender: "user456",
        recipient: "user123",
        content: "Hello, world!",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Message sent successfully",
        message: {
          sender: "user456",
          recipient: "user123",
          content: "Hello, world!",
        },
      });
    });

    it("should return 404 if recipient user not found", async () => {
      const req = {
        params: { id: "user123" },
        body: { content: "Hello, world!" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.findById.mockResolvedValue(null);

      await sendMessageToUser(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Recipient user not found",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        params: { id: "user123" },
        body: { content: "Hello, world!" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      User.findById.mockRejectedValue(new Error("Server error"));

      await sendMessageToUser(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});

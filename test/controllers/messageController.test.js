import { describe, it, expect, beforeEach, vi } from "vitest";
import mongoose from "mongoose";
import {
  sendMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
  getInboxMessages,
  replyToMessage,
  sendGroupMessage,
  getGroupMessages,
} from "../../src/controllers/messageController";
import Message from "../../src/models/Message";

// Mock the Message model
vi.mock("../../src/models/Message");

describe("Message Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        recipient: new mongoose.Types.ObjectId().toString(),
        content: "Hello, this is a test message",
      },
      user: {
        id: new mongoose.Types.ObjectId().toString(),
      },
      params: {
        id: new mongoose.Types.ObjectId().toString(),
        groupId: new mongoose.Types.ObjectId().toString(),
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    vi.clearAllMocks();
  });

  describe("sendMessage", () => {
    it("should send a message successfully", async () => {
      const mockMessage = {
        _id: new mongoose.Types.ObjectId().toString(),
        sender: req.user.id,
        recipient: req.body.recipient,
        content: req.body.content,
      };

      Message.create.mockResolvedValue(mockMessage);

      await sendMessage(req, res);

      expect(Message.create).toHaveBeenCalledWith({
        sender: req.user.id,
        recipient: req.body.recipient,
        content: req.body.content,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Message sent successfully",
        message: mockMessage,
      });
    });

    it("should handle server error", async () => {
      const errorMessage = "Server error";
      Message.create.mockRejectedValue(new Error(errorMessage));

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getMessages", () => {
    it("should fetch user messages successfully", async () => {
      const mockMessages = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          sender: req.user.id,
          recipient: req.body.recipient,
          content: "Test message",
          createdAt: new Date(),
        },
      ];

      Message.find.mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockMessages),
      });

      await getMessages(req, res);

      expect(Message.find).toHaveBeenCalledWith({
        $or: [{ sender: req.user.id }, { recipient: req.user.id }],
      });
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });

    it('should handle server error', async () => {
      const errorMessage = 'Server error';
      Message.find.mockImplementation(() => {
        throw new Error("Server error");
      });

      await getMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe("markMessageAsRead", () => {
    it("should mark message as read successfully", async () => {
      const mockMessage = {
        _id: req.params.id,
        read: false,
        save: vi.fn().mockResolvedValue(true),
      };

      Message.findById.mockResolvedValue(mockMessage);

      await markMessageAsRead(req, res);

      expect(mockMessage.read).toBe(true);
      expect(mockMessage.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockMessage);
    });

    it("should return 404 if message not found", async () => {
      Message.findById.mockResolvedValue(null);

      await markMessageAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Message not found" });
    });

    it("should handle server error", async () => {
      const errorMessage = "Server error";
      Message.findById.mockRejectedValue(new Error(errorMessage));

      await markMessageAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("deleteMessage", () => {
    it("should delete a message successfully", async () => {
      const mockMessage = {
        _id: req.params.id,
      };

      Message.findById.mockResolvedValue(mockMessage);
      Message.findByIdAndDelete.mockResolvedValue(mockMessage);

      await deleteMessage(req, res);

      expect(Message.findByIdAndDelete).toHaveBeenCalledWith(req.params.id);
      expect(res.json).toHaveBeenCalledWith({
        message: "Message deleted successfully",
      });
    });

    it("should return 404 if message not found", async () => {
      Message.findById.mockResolvedValue(null);

      await deleteMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Message not found" });
    });

    it("should handle server error", async () => {
      const errorMessage = "Server error";
      Message.findById.mockRejectedValue(new Error(errorMessage));

      await deleteMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getInboxMessages", () => {
    it("should fetch inbox messages successfully", async () => {
      const mockMessages = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          recipient: req.user.id,
          content: "Test message",
          createdAt: new Date(),
        },
      ];

      Message.find.mockReturnValue(mockMessages)
      

      await getInboxMessages(req, res);

      expect(Message.find).toHaveBeenCalledWith({ recipient: req.user.id });
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });

    it('should return a message if no messages are found', async () => {

      Message.find.mockResolvedValue ([]);

      await getInboxMessages(req, res);

      expect(Message.find).toHaveBeenCalledWith({ recipient: req.user.id });
       expect(res.json).toHaveBeenCalledWith({ message: 'You have no messages' });
    });

    it('should handle server error', async () => {
      const errorMessage = 'Server error';
      Message.find.mockRejectedValue(new Error(errorMessage));

      await getInboxMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });

  describe("replyToMessage", () => {
    it("should reply to a message successfully", async () => {
      const mockMessage = {
        _id: req.params.id,
        sender: new mongoose.Types.ObjectId().toString(),
      };
      const mockReply = {
        _id: new mongoose.Types.ObjectId().toString(),
        sender: req.user.id,
        recipient: mockMessage.sender,
        content: req.body.content,
      };

      Message.findById.mockResolvedValue(mockMessage);
      Message.create.mockResolvedValue(mockReply);

      await replyToMessage(req, res);

      expect(Message.findById).toHaveBeenCalledWith(req.params.id);
      expect(Message.create).toHaveBeenCalledWith({
        sender: req.user.id,
        recipient: mockMessage.sender,
        content: req.body.content,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Reply sent successfully",
        reply: mockReply,
      });
    });

    it("should return 404 if message not found", async () => {
      Message.findById.mockResolvedValue(null);

      await replyToMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Message not found" });
    });

    it("should handle server error", async () => {
      const errorMessage = "Server error";
      Message.findById.mockRejectedValue(new Error(errorMessage));

      await replyToMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("sendGroupMessage", () => {
    it("should send a group message successfully", async () => {
      const mockMessage = {
        _id: new mongoose.Types.ObjectId().toString(),
        sender: req.user.id,
        content: req.body.content,
        groupId: req.params.groupId,
      };

      Message.create.mockResolvedValue(mockMessage);

      await sendGroupMessage(req, res);

      expect(Message.create).toHaveBeenCalledWith({
        sender: req.user.id,
        content: req.body.content,
        groupId: req.params.groupId,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Group message sent successfully",
        message: mockMessage,
      });
    });

    it("should handle server error", async () => {
      const errorMessage = "Server error";
      Message.create.mockRejectedValue(new Error(errorMessage));

      await sendGroupMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getGroupMessages", () => {
    it("should fetch group messages successfully", async () => {
      const mockMessages = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          groupId: req.params.groupId,
          content: "Test group message",
          createdAt: new Date(),
        },
      ];

      Message.find.mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockMessages),
      });

      await getGroupMessages(req, res);

      expect(Message.find).toHaveBeenCalledWith({
        groupId: req.params.groupId,
      });
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });

    it('should handle server error', async () => {
      const errorMessage = 'Server error';
     Message.find.mockImplementation(() => {
        throw new Error("Server error");
      });

      await getGroupMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
    });
  });
});

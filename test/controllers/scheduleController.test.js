import { describe, it, expect, afterEach, vi } from "vitest";
import mongoose from "mongoose";
import Schedule from "../../src/models/Schedule.js";
import {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "../../src/controllers/scheduleController.js";
import { validateSchedule } from "../../src/validators/scheduleValidator.js";

vi.mock("../../src/models/Schedule.js");
vi.mock("../../src/validators/scheduleValidator.js");

describe("Schedule Controller Tests", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getSchedules", () => {
    it("should fetch all schedules and return 200 status", async () => {
      const req = {};
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Schedule.find.mockResolvedValue([
        {
          _id: "schedule123",
          dayOfWeek: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          courseName: "Math",
        },
      ]);

      await getSchedules(req, res);

      expect(Schedule.find).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith([
        {
          _id: "schedule123",
          dayOfWeek: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          courseName: "Math",
        },
      ]);
    });

    it("should return 200 with a message if no schedules found", async () => {
      const req = {};
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Schedule.find.mockResolvedValue([]);

      await getSchedules(req, res);

      expect(Schedule.find).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith({ message: "No schedules yet" });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {};
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Schedule.find.mockRejectedValue(new Error("Server error"));

      await getSchedules(req, res);

      expect(Schedule.find).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getScheduleById", () => {
    it("should fetch schedule by id and return 200 status", async () => {
      const scheldule = {
        _id: new mongoose.Types.ObjectId().toString(),
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        courseName: "Math",
      };
      const req = {
        params: { id: scheldule._id },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Schedule.findById.mockResolvedValue(scheldule);

      await getScheduleById(req, res);

      expect(Schedule.findById).toHaveBeenCalledWith(scheldule._id);
      expect(res.json).toHaveBeenCalledWith({
        _id: scheldule._id,
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        courseName: "Math",
      });
    });

    it("should return 404 if schedule not found", async () => {
      const req = {
        params: { id: "schedule123" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Schedule.findById.mockResolvedValue(null);

      await getScheduleById(req, res);

      expect(Schedule.findById).toHaveBeenCalledWith("schedule123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Schedule not found" });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        params: { id: "schedule123" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Schedule.findById.mockRejectedValue(new Error("Server error"));

      await getScheduleById(req, res);

      expect(Schedule.findById).toHaveBeenCalledWith("schedule123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("createSchedule", () => {
    it("should create a new schedule and return 201 status", async () => {
      const req = {
        body: {
          dayOfWeek: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          courseName: "Math",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      validateSchedule.mockReturnValue({ error: null });
      const id = new mongoose.Types.ObjectId().toString();
      const mockSchedule = {
        _id: id,
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        courseName: "Math",
        save: vi.fn().mockResolvedValue({
          _id: id,
          dayOfWeek: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          courseName: "Math",
        }),
      };

      Schedule.mockImplementation(() => mockSchedule);

      await createSchedule(req, res);

      expect(validateSchedule).toHaveBeenCalledWith(req.body);
      expect(mockSchedule.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: mockSchedule._id,
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        courseName: "Math",
      });
    });
    it("should return 400 if schedule validation fails", async () => {
      const req = {
        body: {
          dayOfWeek: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          courseName: "Math",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      validateSchedule.mockReturnValue({
        error: { details: [{ message: "Invalid schedule data" }] },
      });

      await createSchedule(req, res);

      expect(validateSchedule).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Invalid schedule data");
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        body: {
          dayOfWeek: "Monday",
          startTime: "09:00",
          endTime: "10:00",
          courseName: "Math",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      validateSchedule.mockReturnValue({ error: null });

      const mockSchedule = {
        save: vi.fn().mockRejectedValue(new Error("Server error")),
      };

      Schedule.mockImplementation(() => mockSchedule);

      await createSchedule(req, res);

      expect(validateSchedule).toHaveBeenCalledWith(req.body);
      expect(mockSchedule.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("updateSchedule", () => {
    it("should update a schedule and return 200 status", async () => {
      const req = {
        params: { id: "schedule123" },
        body: {
          dayOfWeek: "Tuesday",
          startTime: "10:00",
          endTime: "11:00",
          courseName: "Science",
        },
      };

      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
        send: vi.fn(() => res),
      };

      validateSchedule.mockReturnValue({ error: null });
      Schedule.findById.mockResolvedValue({
        _id: "schedule123",
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        courseName: "Math",
        save: vi.fn().mockResolvedValue({
          _id: "schedule123",
          dayOfWeek: "Tuesday",
          startTime: "10:00",
          endTime: "11:00",
          courseName: "Science",
        }),
      });

      await updateSchedule(req, res);

      expect(validateSchedule).toHaveBeenCalledWith(req.body);
      expect(Schedule.findById).toHaveBeenCalledWith("schedule123");
      expect(res.json).toHaveBeenCalledWith({
        _id: "schedule123",
        dayOfWeek: "Tuesday",
        startTime: "10:00",
        endTime: "11:00",
        courseName: "Science",
      });
    });

    it("should return 400 if schedule validation fails", async () => {
      const req = {
        params: { id: "schedule123" },
        body: {
          dayOfWeek: "Tuesday",
          startTime: "10:00",
          endTime: "11:00",
          courseName: "Science",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      validateSchedule.mockReturnValue({
        error: { details: [{ message: "Invalid schedule data" }] },
      });

      await updateSchedule(req, res);

      expect(validateSchedule).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Invalid schedule data");
    });

    it("should return 404 if schedule not found", async () => {
      const req = {
        params: { id: "schedule123" },
        body: {
          dayOfWeek: "Tuesday",
          startTime: "10:00",
          endTime: "11:00",
          courseName: "Science",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      validateSchedule.mockReturnValue({ error: null });
      Schedule.findById.mockResolvedValue(null);

      await updateSchedule(req, res);

      expect(Schedule.findById).toHaveBeenCalledWith("schedule123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Schedule not found" });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        params: { id: "schedule123" },
        body: {
          dayOfWeek: "Tuesday",
          startTime: "10:00",
          endTime: "11:00",
          courseName: "Science",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      validateSchedule.mockReturnValue({ error: null });
      Schedule.findById.mockRejectedValue(new Error("Server error"));

      await updateSchedule(req, res);

      expect(Schedule.findById).toHaveBeenCalledWith("schedule123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("deleteSchedule", () => {
    it("should delete a schedule and return 200 status", async () => {
      const req = {
        params: { id: "schedule123" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Schedule.findById.mockResolvedValue({
        _id: "schedule123",
        remove: vi.fn().mockResolvedValue({}),
      });

      await deleteSchedule(req, res);

      expect(Schedule.findById).toHaveBeenCalledWith("schedule123");
      expect(res.json).toHaveBeenCalledWith({ message: "Schedule deleted" });
    });

    it("should return 404 if schedule not found", async () => {
      const req = {
        params: { id: "schedule123" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Schedule.findById.mockResolvedValue(null);

      await deleteSchedule(req, res);

      expect(Schedule.findById).toHaveBeenCalledWith("schedule123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Schedule not found" });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        params: { id: "schedule123" },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Schedule.findById.mockRejectedValue(new Error("Server error"));

      await deleteSchedule(req, res);

      expect(Schedule.findById).toHaveBeenCalledWith("schedule123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});

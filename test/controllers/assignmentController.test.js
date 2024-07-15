import { describe, it, expect, vi, afterEach } from "vitest";
import Assignment from "../../src/models/Assignment.js";
import {
  createAssignment,
  getAssignmentById,
  getAssignments,
  updateAssignment,
  deleteAssignment,
} from "../../src/controllers/assignmentController.js";
import { validateAssignment } from "../../src/validators/assignmentValidator.js";

vi.mock("../../src/models/Assignment.js");
vi.mock("../../src/validators/assignmentValidator.js");

describe("Assignment Controller Tests", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe("Create Assignment", () => {
    it("should create an assignment and return 201 status", async () => {
      const req = {
        body: {
          title: "New Assignment",
          description: "Assignment Description",
          dueDate: "2024-08-01",
        },
        user: { id: "instructor123" },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockAssignment = {
        _id: "assignment123",
        title: "New Assignment",
        description: "Assignment Description",
        dueDate: "2024-08-01",
        instructor: "instructor123",
      };

      validateAssignment.mockReturnValue({ error: null });
      Assignment.create.mockResolvedValue(mockAssignment);

      await createAssignment(req, res);

      expect(validateAssignment).toHaveBeenCalledWith(req.body);
      expect(Assignment.create).toHaveBeenCalledWith({
        title: "New Assignment",
        description: "Assignment Description",
        dueDate: "2024-08-01",
        instructor: "instructor123",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Assignment created successfully",
        assignment: mockAssignment,
      });
    });

    it("should return 400 if validation error occurs", async () => {
      const req = {
        body: {
          title: "",
          description: "Assignment Description",
          dueDate: "2024-08-01",
        },
        user: { id: "instructor123" },
      };
      const res = {
        status: vi.fn(() => res),
        send: vi.fn(),
      };
      validateAssignment.mockReturnValue({
        error: { details: [{ message: "Title is required" }] },
      });

      await createAssignment(req, res);

      expect(validateAssignment).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Title is required");
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        body: {
          title: "New Assignment",
          description: "Assignment Description",
          dueDate: "2024-08-01",
        },
        user: { id: "instructor123" },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      validateAssignment.mockReturnValue({ error: null });
      Assignment.create.mockImplementation(() => {
        throw new Error("Server error");
      });


      await createAssignment(req, res);

      expect(validateAssignment).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
  describe("Get Assignments", () => {
    it("should fetch all assignments and return 200 status", async () => {
      const req = {};
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockAssignments = [
        {
          _id: "assignment123",
          title: "Test Assignment",
          description: "Test Description",
          dueDate: "2024-07-01",
          instructor: { _id: "instructor123", username: "testinstructor" },
        },
      ];

      const populateMock = vi.fn().mockResolvedValue(mockAssignments);
      Assignment.find.mockReturnValue({ populate: populateMock });

      await getAssignments(req, res);

      expect(Assignment.find).toHaveBeenCalledWith();
      expect(populateMock).toHaveBeenCalledWith("instructor", "username");
      expect(res.json).toHaveBeenCalledWith(mockAssignments);
    });

    it("should return 500 if server error occurs", async () => {
      const req = {};
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      Assignment.find.mockImplementation(() => {
        throw new Error("Server error");
      });
      await getAssignments(req, res);

      expect(Assignment.find).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
  describe(" Get Assignment By ID", () => {
    it("should fetch an assignment by ID and return 200 status", async () => {
      const req = { params: { id: "assignment123" } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockAssignment = {
        _id: "assignment123",
        title: "Test Assignment",
        description: "Test Description",
        dueDate: "2024-07-01",
        instructor: { _id: "instructor123", username: "testinstructor" },
      };

      const populateMock = vi.fn().mockResolvedValue(mockAssignment);
      Assignment.findById.mockReturnValue({ populate: populateMock });

      await getAssignmentById(req, res);

      expect(Assignment.findById).toHaveBeenCalledWith("assignment123");
      expect(populateMock).toHaveBeenCalledWith("instructor", "username");
      expect(res.json).toHaveBeenCalledWith(mockAssignment);
    });
    it("should return 404 if assignment is not found", async () => {
      const req = {
        params: {
          id: "assignmentId123",
        },
      };

      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      Assignment.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      });

      await getAssignmentById(req, res);

      expect(Assignment.findById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Assignment not found",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = { params: { id: "assignment123" } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      Assignment.findById.mockImplementation(() => {
        throw new Error("Server error");
      });

      await getAssignmentById(req, res);

      expect(Assignment.findById).toHaveBeenCalledWith("assignment123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
  describe("Update Assignment", () => {
    it("should update an assignment and return 200 status", async () => {
      const req = {
        params: { id: "assignment123" },
        body: {
          title: "Updated Assignment",
          description: "Updated Description",
          dueDate: "2024-08-01",
        },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockAssignment = {
        _id: "assignment123",
        title: "Original Assignment",
        description: "Original Description",
        dueDate: "2024-07-01",
        save: vi.fn().mockResolvedValue(),
      };

      validateAssignment.mockReturnValue({ error: null });
      Assignment.findById.mockResolvedValue(mockAssignment);

      await updateAssignment(req, res);

      expect(validateAssignment).toHaveBeenCalledWith(req.body);
      expect(Assignment.findById).toHaveBeenCalledWith("assignment123");

      expect(mockAssignment.title).toBe("Updated Assignment");
      expect(mockAssignment.description).toBe("Updated Description");
      expect(mockAssignment.dueDate).toBe("2024-08-01");
      expect(res.json).toHaveBeenCalledWith({
        message: "Assignment updated successfully",
        assignment: mockAssignment,
      });
    });

    it("should return 400 if validation error occurs", async () => {
      const req = {
        params: { id: "assignment123" },
        body: {
          title: "",
          description: "Updated Description",
          dueDate: "2024-08-01",
        },
      };
      const res = {
        status: vi.fn(() => res),
        send: vi.fn(),
      };

      const mockError = { details: [{ message: "Title is required" }] };
      validateAssignment.mockReturnValue({ error: mockError });

      await updateAssignment(req, res);

      expect(validateAssignment).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Title is required");
    });

    it("should return 404 if assignment not found", async () => {
      const req = {
        params: { id: "assignment123" },
        body: {
          title: "Updated Assignment",
          description: "Updated Description",
          dueDate: "2024-08-01",
        },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      validateAssignment.mockReturnValue({ error: null });
      Assignment.findById.mockResolvedValue(null);

      await updateAssignment(req, res);

      expect(validateAssignment).toHaveBeenCalledWith(req.body);
      expect(Assignment.findById).toHaveBeenCalledWith("assignment123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Assignment not found",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        params: { id: "assignment123" },
        body: {
          title: "Updated Assignment",
          description: "Updated Description",
          dueDate: "2024-08-01",
        },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      validateAssignment.mockReturnValue({ error: null });
      Assignment.findById.mockRejectedValue(new Error("Server error"));

      await updateAssignment(req, res);

      expect(validateAssignment).toHaveBeenCalledWith(req.body);
      expect(Assignment.findById).toHaveBeenCalledWith("assignment123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
  describe(" Delete Assignment", () => {
    it("should delete an assignment and return 200 status", async () => {
      const req = { params: { id: "assignment123" } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockAssignment = {
        _id: "assignment123",
        remove: vi.fn().mockResolvedValue({}),
      };

      Assignment.findById.mockResolvedValue(mockAssignment);
      Assignment.findByIdAndDelete.mockResolvedValue(mockAssignment);

      await deleteAssignment(req, res);

      expect(Assignment.findById).toHaveBeenCalledWith("assignment123");
      expect(Assignment.findByIdAndDelete).toHaveBeenCalledWith(
        "assignment123"
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Assignment deleted successfully",
      });
    });

    it("should return 404 if assignment not found", async () => {
      const req = { params: { id: "assignment123" } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      Assignment.findById.mockResolvedValue(null);

      await deleteAssignment(req, res);

      expect(Assignment.findById).toHaveBeenCalledWith("assignment123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Assignment not found",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = { params: { id: "assignment123" } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      Assignment.findById.mockRejectedValue(new Error("Server error"));

      await deleteAssignment(req, res);

      expect(Assignment.findById).toHaveBeenCalledWith("assignment123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});

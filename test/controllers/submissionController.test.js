import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import mongoose from "mongoose";
import Submission from "../../src/models/Submission.js";
import {
  submitAssignment,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  gradeSubmission,
} from "../../src/controllers/submissionController.js";
vi.mock("../../src/models/Submission.js");

describe("Submission Controller Tests", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("submitAssignment", () => {
    it("should create a new submission and return 201 status", async () => {
      const req = {
        user: { id: "student123" },
        body: { assignmentId: "assignment123", files: ["file1", "file2"] },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockSubmission = {
        id: "submission123",
        student: "student123",
        assignment: "assignment123",
        files: ["file1", "file2"],
      };
      Submission.create.mockResolvedValue(mockSubmission);

      await submitAssignment(req, res);

      expect(Submission.create).toHaveBeenCalledWith({
        student: "student123",
        assignment: "assignment123",
        files: ["file1", "file2"],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Assignment submitted successfully",
        submission: mockSubmission,
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        user: { id: "student123" },
        body: { assignmentId: "assignment123", files: ["file1", "file2"] },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };


      Submission.create.mockRejectedValue(new Error("Server error"));

      await submitAssignment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getSubmissions", () => {
    it("should fetch all submissions and return 200 status", async () => {
      const req = {};
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      const mockSubmissions = [
        {
          _id: "submission123",
          student: { _id: "student123", username: "testuser" },
          assignment: { _id: "assignment123", title: "testassignment" },
          files: ["file1", "file2"],
        },
      ];

      Submission.find.mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockImplementation((callback) => callback(mockSubmissions)),
      });

      await getSubmissions(req, res);

      expect(Submission.find).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith(mockSubmissions);
    });

    it("should return 500 if server error occurs", async () => {
      const req = {};
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Submission.find.mockReturnValue(new Error("Server error"));

      await getSubmissions(req, res);

      expect(Submission.find).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getSubmissionById", () => {
    it("should fetch a submission by ID and return 200 status", async () => {
      const req = { params: { id: "submission123" } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const mockSubmission = {
        _id: "submission123",
        student: { _id: "student123", username: "testuser" },
        assignment: { _id: "assignment123", title: "testassignment" },
        files: ["file1", "file2"],
      };

      Submission.findById.mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockImplementation((callback) => callback(mockSubmission)),
      });

      await getSubmissionById(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");

      expect(res.json).toHaveBeenCalledWith(mockSubmission);
    });

    it("should return 404 if submission not found", async () => {
      const req = { params: { id: "submission123" } };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const populateMock = vi.fn().mockReturnThis();
      Submission.findById.mockReturnValue({
        populate: populateMock.mockReturnValue({
          populate: vi.fn().mockResolvedValue(null),
        }),
      });

      await getSubmissionById(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Submission not found",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = { params: { id: "submission123" } };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Submission.findById.mockImplementation(() => {
        throw new Error("Server error");
      });

      await getSubmissionById(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("updateSubmission", () => {
    it("should update a submission and return 200 status", async () => {
      const req = {
        params: { id: "submission123" },
        body: { files: ["newFile1", "newFile2"] },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      const mockSubmission = {
        _id: "submission123",
        files: ["file1", "file2"],
        save: vi.fn().mockResolvedValue(),
      };
      Submission.findById.mockResolvedValue(mockSubmission);

      await updateSubmission(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");
      expect(mockSubmission.files).toEqual(["newFile1", "newFile2"]);
      expect(mockSubmission.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Submission updated successfully",
        submission: mockSubmission,
      });
    });

    it("should return 404 if submission not found", async () => {
      const req = {
        params: { id: "submission123" },
        body: { files: ["newFile1", "newFile2"] },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Submission.findById.mockResolvedValue(null);

      await updateSubmission(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Submission not found",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        params: { id: "submission123" },
        body: { files: ["newFile1", "newFile2"] },
      };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Submission.findById.mockRejectedValue(new Error("Server error"));

      await updateSubmission(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("deleteSubmission", () => {
    it("should delete a submission and return 200 status", async () => {
      const req = { params: { id: "submission123" } };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      const mockSubmission = {
        _id: "submission123",
        remove: vi.fn().mockResolvedValue(),
      };
      Submission.findById.mockResolvedValue(mockSubmission);

      await deleteSubmission(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");
      expect(mockSubmission.remove).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Submission deleted successfully",
      });
    });

    it("should return 404 if submission not found", async () => {
      const req = { params: { id: "submission123" } };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Submission.findById.mockResolvedValue(null);

      await deleteSubmission(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Submission not found",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = { params: { id: "submission123" } };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Submission.findById.mockRejectedValue(new Error("Server error"));

      await deleteSubmission(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  
  });

  describe("gradeSubmission", () => {
    it("should grade a submission and return 200 status", async () => {
      const req = { params: { id: "submission123" }, body: { grade: "A" } };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      const mockSubmission = {
        _id: "submission123",
        grade: "B",
        save: vi.fn().mockResolvedValue(),
      };
      Submission.findById.mockResolvedValue(mockSubmission);

      await gradeSubmission(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");
      expect(mockSubmission.grade).toEqual("A");
      expect(mockSubmission.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Submission graded successfully",
        submission: mockSubmission,
      });
    });

    it("should return 404 if submission not found", async () => {
      const req = { params: { id: "submission123" }, body: { grade: "A" } };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Submission.findById.mockResolvedValue(null);

      await gradeSubmission(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Submission not found",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = { params: { id: "submission123" }, body: { grade: "A" } };
      const res = {
        json: vi.fn(),
        status: vi.fn(() => res),
      };

      Submission.findById.mockRejectedValue(new Error("Server error"));

      await gradeSubmission(req, res);

      expect(Submission.findById).toHaveBeenCalledWith("submission123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});

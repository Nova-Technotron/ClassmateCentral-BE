import { describe, it, expect, vi, afterEach } from "vitest";
import mongoose from "mongoose";
import Class from "../../src/models/Class.js";
import { validateClass } from "../../src/validators/classValidator.js";
import {
  createClass,
  getClasses,
  joinClass,
  leaveClass,
  updateClass,
  deleteClass,
} from "../../src/controllers/classController.js";

vi.mock("../../src/models/Class.js");
vi.mock("../../src/validators/classValidator.js");

describe("Class Controller", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createClass", () => {
    it("should create a new class and return 201 status", async () => {
      const req = {
        body: {
          className: "Math 101",
          classCode: "MTH101",
        },
        user: {
          id: new mongoose.Types.ObjectId().toString(),
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      validateClass.mockReturnValue({ error: null });
      Class.findOne.mockResolvedValue(null);

      const id = new mongoose.Types.ObjectId().toString();
      const mockClassInstance = {
        _id: id,
        className: "Math 101",
        classCode: "MTH101",
        createdBy: req.user.id,
        save: vi.fn().mockResolvedValue({
          _id: id,
          className: "Math 101",
          classCode: "MTH101",
          createdBy: req.user.id,
        }),
      };

      Class.mockImplementation(() => mockClassInstance);

      await createClass(req, res);

      expect(validateClass).toHaveBeenCalledWith(req.body);
      expect(Class.findOne).toHaveBeenCalledWith({
        $or: [{ classCode: "MTH101" }, { className: "Math 101" }],
      });
      expect(mockClassInstance.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Class created successfully",
        class: {
          _id: id,
          className: "Math 101",
          classCode: "MTH101",
          createdBy: req.user.id,
        },
      });
    });

    it("should return 400 if class validation fails", async () => {
      const req = {
        body: {
          className: "Math 101",
          classCode: "MTH101",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      validateClass.mockReturnValue({
        error: { details: [{ message: "Invalid class data" }] },
      });

      await createClass(req, res);

      expect(validateClass).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Invalid class data");
    });

    it("should return 400 if class already exists", async () => {
      const req = {
        body: {
          className: "Math 101",
          classCode: "MTH101",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      validateClass.mockReturnValue({ error: null });
      Class.findOne.mockResolvedValue({
        _id: "existingClass123",
        className: "Math 101",
        classCode: "MTH101",
      });

      await createClass(req, res);

      expect(validateClass).toHaveBeenCalledWith(req.body);
      expect(Class.findOne).toHaveBeenCalledWith({
        $or: [{ classCode: "MTH101" }, { className: "Math 101" }],
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Class already exists",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        body: {
          className: "Math 101",
          classCode: "MTH101",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      validateClass.mockReturnValue({ error: null });
      Class.findOne.mockRejectedValue(new Error("Server error"));

      await createClass(req, res);

      expect(validateClass).toHaveBeenCalledWith(req.body);
      expect(Class.findOne).toHaveBeenCalledWith({
        $or: [{ classCode: "MTH101" }, { className: "Math 101" }],
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getClasses", () => {
    it("should return a list of classes", async () => {
      const req = {};

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      const classes = [
        { _id: "class1", className: "Math 101", classCode: "MTH101" },
        { _id: "class2", className: "Science 101", classCode: "SCI101" },
      ];

      Class.find.mockResolvedValue(classes);

      await getClasses(req, res);

      expect(Class.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(classes);
    });

    it("should return 500 if server error occurs", async () => {
      const req = {};

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      Class.find.mockRejectedValue(new Error("Server error"));

      await getClasses(req, res);

      expect(Class.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("joinClass", () => {
    it("should enroll the user in the class", async () => {
      const req = {
        body: {
          classCode: "MTH101",
        },
        user: {
          id: new mongoose.Types.ObjectId().toString(),
          enrolledClasses: [],
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      const cls = {
        _id: new mongoose.Types.ObjectId().toString(),
        classCode: "MTH101",
        members: [],
        save: vi.fn().mockResolvedValue({}),
      };

      Class.findOne.mockResolvedValue(cls);
      req.user.save = vi.fn().mockResolvedValue({});

      await joinClass(req, res);

      expect(Class.findOne).toHaveBeenCalledWith({ classCode: "MTH101" });
      expect(cls.members).toContain(req.user.id);
      expect(req.user.enrolledClasses).toContain(cls._id);
      expect(cls.save).toHaveBeenCalled();
      expect(req.user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "You have successfully enrolled in the class",
        class: cls,
      });
    });

    it("should return 404 if class is not found", async () => {
      const req = {
        body: {
          classCode: "MTH101",
        },
        user: {
          id: new mongoose.Types.ObjectId().toString(),
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      Class.findOne.mockResolvedValue(null);

      await joinClass(req, res);

      expect(Class.findOne).toHaveBeenCalledWith({ classCode: "MTH101" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Class not found" });
    });

    it("should return 400 if user is already enrolled in the class", async () => {
      const req = {
        body: {
          classCode: "MTH101",
        },
        user: {
          id: new mongoose.Types.ObjectId().toString(),
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      const cls = {
        _id: "class123",
        classCode: "MTH101",
        members: [req.user.id],
      };

      Class.findOne.mockResolvedValue(cls);

      await joinClass(req, res);

      expect(Class.findOne).toHaveBeenCalledWith({ classCode: "MTH101" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "You are already enrolled in this class",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        body: {
          classCode: "MTH101",
        },
        user: {
          id: new mongoose.Types.ObjectId().toString(),
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      Class.findOne.mockRejectedValue(new Error("Server error"));

      await joinClass(req, res);

      expect(Class.findOne).toHaveBeenCalledWith({ classCode: "MTH101" });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("leaveClass", () => {
    it("should allow the user to leave the class", async () => {
      const req = {
        params: {
          id: "class123",
        },
        user: {
          id: "user123",
          enrolledClasses: ["class123"],
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      const cls = {
        _id: "class123",
        members: ["user123"],
        save: vi.fn().mockResolvedValue({}),
      };

      Class.findById.mockResolvedValue(cls);
      req.user.save = vi.fn().mockResolvedValue({});

      await leaveClass(req, res);

      expect(Class.findById).toHaveBeenCalledWith("class123");
      expect(cls.members).not.toContain("user123");
      expect(req.user.enrolledClasses).not.toContain("class123");
      expect(cls.save).toHaveBeenCalled();
      expect(req.user.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "You have successfully left the class",
        class: cls,
      });
    });

    it("should return 404 if class is not found", async () => {
      const req = {
        params: {
          id: "class123",
        },
        user: {
          id: "user123",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      Class.findById.mockResolvedValue(null);

      await leaveClass(req, res);

      expect(Class.findById).toHaveBeenCalledWith("class123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Class not found" });
    });

    it("should return 400 if user is not enrolled in the class", async () => {
      const req = {
        params: {
          id: "class123",
        },
        user: {
          id: "user123",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      const cls = {
        _id: "class123",
        members: [],
      };

      Class.findById.mockResolvedValue(cls);

      await leaveClass(req, res);

      expect(Class.findById).toHaveBeenCalledWith("class123");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "You are not enrolled in this class",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        params: {
          id: "class123",
        },
        user: {
          id: "user123",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      Class.findById.mockRejectedValue(new Error("Server error"));

      await leaveClass(req, res);

      expect(Class.findById).toHaveBeenCalledWith("class123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("updateClass", () => {
    it("should update the class and return the updated class", async () => {
      const classId = new mongoose.Types.ObjectId().toString();
      const userId = new mongoose.Types.ObjectId().toString();
      const req = {
        params: {
          id: classId,
        },
        body: {
          className: "Math 102",
          classCode: "MTH102",
        },
        user: {
          id: userId,
          isAdmin: true,
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      validateClass.mockReturnValue({ error: null });
      const cls = {
        _id: req.params.id,
        className: "Math 101",
        classCode: "MTH101",
        createdBy: req.user.id,
        save: vi.fn().mockResolvedValue({
          _id: req.params.id,
          className: "Math 101",
          classCode: "MTH101",
          createdBy: req.user.id,
        }),
      };

      Class.findById.mockResolvedValue(cls);

      await updateClass(req, res);

      expect(validateClass).toHaveBeenCalledWith(req.body);
      expect(Class.findById).toHaveBeenCalledWith(req.params.id);
      expect(cls.className).toBe("Math 102");
      expect(cls.classCode).toBe("MTH102");
      expect(cls.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: "Class updated successfully",
        class: {
          _id: cls._id,
          className: "Math 101",
          classCode: "MTH101",
          createdBy: cls.createdBy,
        },
      });
    });

    it("should return 400 if class validation fails", async () => {
      const req = {
        params: {
          id: "class123",
        },
        body: {
          className: "Math 102",
          classCode: "MTH102",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      validateClass.mockReturnValue({
        error: { details: [{ message: "Invalid class data" }] },
      });

      await updateClass(req, res);

      expect(validateClass).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Invalid class data");
    });

    it("should return 404 if class is not found", async () => {
      const req = {
        params: {
          id: "class123",
        },
        body: {
          className: "Math 102",
          classCode: "MTH102",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      validateClass.mockReturnValue({ error: null });
      Class.findById.mockResolvedValue(null);

      await updateClass(req, res);

      expect(validateClass).toHaveBeenCalledWith(req.body);
      expect(Class.findById).toHaveBeenCalledWith("class123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Class not found" });
    });

    it("should return 403 if user is not authorized to update the class", async () => {
      const req = {
        params: {
          id: "class123",
        },
        body: {
          className: "Math 102",
          classCode: "MTH102",
        },
        user: {
          id: "user456",
          isAdmin: false,
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      validateClass.mockReturnValue({ error: null });
      const cls = {
        _id: "class123",
        className: "Math 101",
        classCode: "MTH101",
        createdBy: "user123",
        save: vi.fn().mockResolvedValue({}),
      };

      Class.findById.mockResolvedValue(cls);

      await updateClass(req, res);

      expect(validateClass).toHaveBeenCalledWith(req.body);
      expect(Class.findById).toHaveBeenCalledWith("class123");
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Not authorized to update this class",
      });
    });

    it("should return 500 if server error occurs", async () => {
      const req = {
        params: {
          id: "class123",
        },
        body: {
          className: "Math 102",
          classCode: "MTH102",
        },
      };

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      validateClass.mockReturnValue({ error: null });
      Class.findById.mockRejectedValue(new Error("Server error"));

      await updateClass(req, res);

      expect(validateClass).toHaveBeenCalledWith(req.body);
      expect(Class.findById).toHaveBeenCalledWith("class123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
  describe("Class Controller - deleteClass", () => {
   
  
    it("should delete a class and return success message", async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const req = {
        params: {
          id: mockId,
        },
        user: {
          id: new mongoose.Types.ObjectId().toString(),
          isAdmin: true, // Assuming the user is an admin for this test
        },
      };
  
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
  
      const mockClass = {
        _id: mockId,
        createdBy: req.user.id,
      };
  
   
      Class.findById.mockResolvedValue(mockClass);

      Class.findByIdAndDelete.mockResolvedValue({});
  
      await deleteClass(req, res);
  
      expect(Class.findById).toHaveBeenCalledWith(mockId);
      expect(Class.findByIdAndDelete).toHaveBeenCalledWith(mockId);
      expect(res.json).toHaveBeenCalledWith({ message: "Class deleted successfully" });
    });
  
    it("should return 404 if class is not found", async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const req = {
        params: {
          id: mockId,
        },
        user: {
          id: new mongoose.Types.ObjectId().toString(),
          isAdmin: true,
        },
      };
  
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
  
      // Mock findById to return null (class not found)
      Class.findById.mockResolvedValue(null);
  
      await deleteClass(req, res);
  
      expect(Class.findById).toHaveBeenCalledWith(mockId);
      expect(Class.findByIdAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Class not found" });
    });
  
    it("should return 403 if user is not authorized to delete the class", async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const req = {
        params: {
          id: mockId,
        },
        user: {
          id: new mongoose.Types.ObjectId().toString(),
          isAdmin: false, // User is not an admin
        },
      };
  
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
  
      const mockClass = {
        _id: mockId,
        createdBy: new mongoose.Types.ObjectId().toString(), // Different user ID from req.user.id
      };
  
      // Mock findById to return the class
      Class.findById.mockResolvedValue(mockClass);
  
      await deleteClass(req, res);
  
      expect(Class.findById).toHaveBeenCalledWith(mockId);
      expect(Class.findByIdAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Not authorized to delete this class" });
    });
  
    it("should handle 500 server error", async () => {
      const mockId = new mongoose.Types.ObjectId().toString();
      const req = {
        params: {
          id: mockId,
        },
        user: {
          id: new mongoose.Types.ObjectId().toString(),
          isAdmin: true,
        },
      };
  
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
  
      // Mock findById to throw an error
      Class.findById.mockRejectedValue(new Error("Server error"));
  
      await deleteClass(req, res);
  
      expect(Class.findById).toHaveBeenCalledWith(mockId);
      expect(Class.findByIdAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});

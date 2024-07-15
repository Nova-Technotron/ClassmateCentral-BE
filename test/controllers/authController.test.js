import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../../src/models/User.js";
import { sendPasswordResetEmail } from "../../src/utils/email.js";
import {
  validateRegister,
  validateLogin,
} from "../../src/validators/authValidator.js";
import {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../../src/controllers/authController.js";

vi.mock("bcryptjs");
vi.mock("jsonwebtoken");
vi.mock("crypto");
vi.mock("../../src/models/User.js");
vi.mock("../../src/utils/email.js");
vi.mock("../../src/validators/authValidator.js");

const mockRequest = (userData, bodyData, paramsData) => ({
  user: userData,
  body: bodyData,
  params: paramsData,
});

const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("Auth Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user and return 201 status", async () => {
      const req = {
        body: {
          username: "testuser",
          email: "testuser@example.com",
          password: "password123",
          lastName: "Doe",
          firstName: "John",
        },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
        send: vi.fn(),
      };

      const mockSalt = "somesalt";
      const mockHashedPassword = "hashedpassword123";
      const mockUser = {
        save: vi.fn().mockResolvedValue({
          _id: "user123",
          username: "testuser",
          email: "testuser@example.com",
          lastName: "Doe",
          firstName: "John",
        }),
        password: "hashedpassword123",
      };

      validateRegister.mockReturnValue({ error: null });
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue(mockSalt);
      bcrypt.hash.mockResolvedValue(mockHashedPassword);
      User.mockImplementation(() => mockUser);

      await register(req, res);

      expect(validateRegister).toHaveBeenCalledWith(req.body);
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ username: req.body.username }, { email: req.body.email }],
      });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, mockSalt);
      expect(mockUser.save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
      });
    });

    it("should return 400 if validation fails", async () => {
      const req = {
        body: {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
          lastName: "Doe",
          firstName: "John",
        },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      validateRegister.mockReturnValue({
        error: { details: [{ message: "Validation error" }] },
      });

      await register(req, res);

      expect(validateRegister).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Validation error");
    });
    it("should return 409 if user already exists", async () => {
      const req = mockRequest(
        {},
        {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        },
        {}
      );
      const res = mockResponse();

      validateRegister.mockReturnValue({ error: null });
      User.findOne.mockResolvedValue({});

      await register(req, res);

      expect(validateRegister).toHaveBeenCalledWith(req.body);
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ username: "testuser" }, { email: "test@example.com" }],
      });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: "Username or email already exists",
      });
    });

    it("should return 500 on server error", async () => {
      const req = mockRequest(
        {},
        {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        },
        {}
      );
      const res = mockResponse();

      validateRegister.mockReturnValue({ error: null });
      User.findOne.mockRejectedValue(new Error("Server error"));

      await register(req, res);

      expect(validateRegister).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("login", () => {
    it("should log in a user", async () => {
      const req = mockRequest(
        {},
        { email: "test@example.com", password: "password123" },
        {}
      );
      const res = mockResponse();

      validateLogin.mockReturnValue({ error: null });
      User.findOne.mockResolvedValue({
        _id: "user123",
        password: "hashedpassword",
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation((payload, secret, options, callback) => callback(null, 'token'));

      await login(req, res);

      expect(validateLogin).toHaveBeenCalledWith(req.body);
      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { user: { id: "user123" } },
        process.env.JWT_SECRET,
        { expiresIn: "2h" },
        expect.any(Function)
      );
      expect(res.json).toHaveBeenCalledWith({ token: "token" });
    });

    it("should return 400 if validation fails", async () => {
      const req = {
        body: { email: "test@example.com", password: "password123" },
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      validateLogin.mockReturnValue({
        error: { details: [{ message: "Validation error" }] },
      });

      await login(req, res);

      expect(validateLogin).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("Validation error");
    });

    it("should return 400 if user does not exist", async () => {
      const req = mockRequest(
        {},
        { email: "test@example.com", password: "password123" },
        {}
      );
      const res = mockResponse();

      validateLogin.mockReturnValue({ error: null });
      User.findOne.mockResolvedValue(null);

      await login(req, res);

      expect(validateLogin).toHaveBeenCalledWith(req.body);
      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

    it("should return 400 if password is incorrect", async () => {
      const req = mockRequest(
        {},
        { email: "test@example.com", password: "password123" },
        {}
      );
      const res = mockResponse();

      validateLogin.mockReturnValue({ error: null });
      User.findOne.mockResolvedValue({
        _id: "user123",
        password: "hashedpassword",
      });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(validateLogin).toHaveBeenCalledWith(req.body);
      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

    it("should return 500 on server error", async () => {
      const req = mockRequest(
        {},
        { email: "test@example.com", password: "password123" },
        {}
      );
      const res = mockResponse();

      validateLogin.mockReturnValue({ error: null });
      User.findOne.mockRejectedValue(new Error("Server error"));

      await login(req, res);

      expect(validateLogin).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("changePassword", () => {
    it("should change the user password", async () => {
      const req = mockRequest(
        { id: "user123" },
        { currentPassword: "password123", newPassword: "newpassword123" },
        {}
      );
      const res = mockResponse();

      User.findById.mockResolvedValue({
        _id: "user123",
        password: "hashedpassword",
        save: vi.fn().mockResolvedValue(),
      });
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("newhashedpassword");

      await changePassword(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword123", "salt");
      expect(res.json).toHaveBeenCalledWith({
        message: "Password changed successfully",
      });
    });

    it("should return 404 if user not found", async () => {
      const req = mockRequest(
        { id: "user123" },
        { currentPassword: "password123", newPassword: "newpassword123" },
        {}
      );
      const res = mockResponse();

      User.findById.mockResolvedValue(null);

      await changePassword(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 400 if current password is incorrect", async () => {
      const req = mockRequest(
        { id: "user123" },
        { currentPassword: "password123", newPassword: "newpassword123" },
        {}
      );
      const res = mockResponse();

      User.findById.mockResolvedValue({
        _id: "user123",
        password: "hashedpassword",
      });
      bcrypt.compare.mockResolvedValue(false);

      await changePassword(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid current password",
      });
    });

    it("should return 500 on server error", async () => {
      const req = mockRequest(
        { id: "user123" },
        { currentPassword: "password123", newPassword: "newpassword123" },
        {}
      );
      const res = mockResponse();

      User.findById.mockRejectedValue(new Error("Server error"));

      await changePassword(req, res);

      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("forgotPassword", () => {
    // it("should send password reset email and return 200 status", async () => {
    //     const req = {
    //       body: {
    //         email: "testuser@example.com",
    //       },
    //     };
    //     const res = {
    //       status: vi.fn(() => res),
    //       json: vi.fn(),
    //     };

    //     const mockUser = {
    //       _id: "user123",
    //       email: "testuser@example.com",
    //       resetPasswordToken: null,
    //       resetPasswordExpires: null,
    //       save: vi.fn().mockResolvedValue({}),
    //     };

    //     const mockResetToken = "resettoken123";

    //     User.findOne.mockResolvedValue(mockUser);
    //     crypto.randomBytes.mockImplementation((size, callback) => {
    //       callback(null, Buffer.from(mockResetToken));
    //     });
    //     sendPasswordResetEmail.mockResolvedValue();

    //     await forgotPassword(req, res);

    //     expect(User.findOne).toHaveBeenCalledWith({ email: "testuser@example.com" });
    //     expect(mockUser.resetPasswordToken).toBe(mockResetToken);
    //     expect(mockUser.resetPasswordExpires).toBeGreaterThan(Date.now());
    //     expect(mockUser.save).toHaveBeenCalled();
    //     expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockUser.email, mockResetToken);
    //     expect(res.json).toHaveBeenCalledWith({ message: "Password reset email sent successfully" });
    //   });
    it("should send a password reset email if user exists", async () => {
      const req = {
        body: {
          email: "test@example.com",
        },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const user = {
        email: "test@example.com",
        resetPasswordToken: null,
        resetPasswordExpires: null,
        save: vi.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(user);
      const resetToken = "randomtoken";
      crypto.randomBytes.mockReturnValue({ toString: () => resetToken });

      await forgotPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(user.resetPasswordToken).toBe(resetToken);
      expect(user.resetPasswordExpires).toBeGreaterThan(Date.now());
      expect(user.save).toHaveBeenCalled();
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        "test@example.com",
        resetToken
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Password reset email sent successfully",
      });
    });

    it("should return 400 if user not found", async () => {
      const req = mockRequest({}, { email: "test@example.com" }, {});
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);

      await forgotPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
    });

    it("should return 500 on server error", async () => {
      const req = mockRequest({}, { email: "test@example.com" }, {});
      const res = mockResponse();

      User.findOne.mockRejectedValue(new Error("Server error"));

      await forgotPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("resetPassword", () => {
    it("should reset the user password", async () => {
      const req = mockRequest(
        {},
        { token: "resetToken", newPassword: "newpassword123" },
        {}
      );
      const res = mockResponse();

      User.findOne.mockResolvedValue({
        _id: "user123",
        password: "hashedpassword",
        save: vi.fn().mockResolvedValue(),
      });
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("newhashedpassword");

      await resetPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: "resetToken",
        resetPasswordExpires: { $gt: expect.any(Number) },
      });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith("newpassword123", "salt");
      expect(res.json).toHaveBeenCalledWith({
        message: "Password reset successful",
      });
    });

    it("should return 400 if token is invalid or expired", async () => {
      const req = mockRequest(
        {},
        { token: "resetToken", newPassword: "newpassword123" },
        {}
      );
      const res = mockResponse();

      User.findOne.mockResolvedValue(null);

      await resetPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: "resetToken",
        resetPasswordExpires: { $gt: expect.any(Number) },
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid or expired token",
      });
    });

    it("should return 500 on server error", async () => {
      const req = mockRequest(
        {},
        { token: "resetToken", newPassword: "newpassword123" },
        {}
      );
      const res = mockResponse();

      User.findOne.mockRejectedValue(new Error("Server error"));

      await resetPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: "resetToken",
        resetPasswordExpires: { $gt: expect.any(Number) },
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});

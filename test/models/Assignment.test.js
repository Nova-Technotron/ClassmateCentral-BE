import { expect, test, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import Assignment from "../../src/models/Assignment";

beforeAll(async () => {
  await mongoose.connect(import.meta.env.VITE_MONGODB_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  await Assignment.deleteMany({});
});

test("should create a new assignment", async () => {
  const mockUser = new mongoose.Types.ObjectId();

  const newAssignment = new Assignment({
    title: "Weekly Coding Challenge",
    description: "Complete the assigned coding problems by the due date.",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
    instructor: mockUser,
  });

  await newAssignment.save();

  const savedAssignment = await Assignment.findOne({
    title: "Weekly Coding Challenge",
  });

  expect(savedAssignment).not.toBeNull();
  expect(savedAssignment.title).toBe("Weekly Coding Challenge");
  expect(savedAssignment.description).toBe(
    "Complete the assigned coding problems by the due date."
  );
  expect(savedAssignment.dueDate).toBeDefined();
  expect(savedAssignment.instructor).toEqual(mockUser);
  expect(savedAssignment.createdAt).toBeDefined();
  expect(savedAssignment.submissions).toEqual([]);
});

test("should not create an assignment with missing required fields", async () => {
  const invalidAssignment = new Assignment({
    description: "Missing assignment details.",
  });

  await expect(invalidAssignment.save()).rejects.toThrow(
    /Assignment validation failed/
  );
});

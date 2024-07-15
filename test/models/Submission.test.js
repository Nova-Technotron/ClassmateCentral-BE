import { expect, test, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import Submission from "../../src/models/Submission";

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
  await Submission.deleteMany({});
});

test("should create a new submission", async () => {
  const mockUser = new mongoose.Types.ObjectId();
  const mockAssignment = new mongoose.Types.ObjectId();

  const newSubmission = new Submission({
    student: mockUser,
    assignment: mockAssignment,
    files: ["submission.pdf"],
  });

  await newSubmission.save();

  const savedSubmission = await Submission.findOne({
    files: ["submission.pdf"],
  });

  expect(savedSubmission).not.toBeNull();
  expect(savedSubmission.student).toEqual(mockUser);
  expect(savedSubmission.assignment).toEqual(mockAssignment);
  expect(savedSubmission.files).toEqual(["submission.pdf"]);
  expect(savedSubmission.grade).toBeNull();
  expect(savedSubmission.submittedAt).toBeDefined();
  expect(savedSubmission.createdAt).toBeDefined();
});

test("should not create a submission with missing required fields", async () => {
  const invalidSubmission = new Submission({});

  await expect(invalidSubmission.save()).rejects.toThrow(
    /Submission validation failed/
  );
});

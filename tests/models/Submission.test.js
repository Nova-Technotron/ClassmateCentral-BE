import { expect, test,beforeAll,afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import Submission from '../../src/models/Submission';
// Connect to an in-memory MongoDB instance for testing
beforeAll(async () => {
  await mongoose.connect(import.meta.env.VITE_MONGODB_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,

  });
});

// Disconnect from MongoDB after all tests
afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  // Clear the submission collection after each test to avoid conflicts
  await Submission.deleteMany({});
});

test('should create a new submission', async () => {
  // Create mock User and Assignment objects (assuming models exist)
  const mockUser = new mongoose.Types.ObjectId();
  const mockAssignment = new mongoose.Types.ObjectId();

  const newSubmission = new Submission({
    student: mockUser,
    assignment: mockAssignment,
    files: ['submission.pdf'],
  });

  await newSubmission.save();

  const savedSubmission = await Submission.findOne({ files: ['submission.pdf'] });

  expect(savedSubmission).not.toBeNull();
  expect(savedSubmission.student).toEqual(mockUser); // Because it's an ObjectId
  expect(savedSubmission.assignment).toEqual(mockAssignment); // Because it's an ObjectId
  expect(savedSubmission.files).toEqual(['submission.pdf']);
  expect(savedSubmission.grade).toBeNull(); // Default value check
  expect(savedSubmission.submittedAt).toBeDefined(); // Date check (approximately now)
  expect(savedSubmission.createdAt).toBeDefined(); // Timestamp check
});

test('should not create a submission with missing required fields', async () => {
  const invalidSubmission = new Submission({});

  await expect(invalidSubmission.save()).rejects.toThrow(/Submission validation failed/);
});
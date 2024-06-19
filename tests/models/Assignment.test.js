import { expect, test,beforeAll,afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import Assignment from '../../src/models/Assignment'; // Replace with the path to your assignment model

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
  // Clear the assignment collection after each test to avoid conflicts
  await Assignment.deleteMany({});
});

test('should create a new assignment', async () => {
  // Create a mock User object for the instructor reference (assuming User model exists)
  const mockUser = new mongoose.Types.ObjectId();

  const newAssignment = new Assignment({
    title: 'Weekly Coding Challenge',
    description: 'Complete the assigned coding problems by the due date.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // One week from now
    instructor: mockUser,
  });

  await newAssignment.save();

  const savedAssignment = await Assignment.findOne({ title: 'Weekly Coding Challenge' });

  expect(savedAssignment).not.toBeNull();
  expect(savedAssignment.title).toBe('Weekly Coding Challenge');
  expect(savedAssignment.description).toBe('Complete the assigned coding problems by the due date.');
  expect(savedAssignment.dueDate).toBeDefined(); // Date check
  expect(savedAssignment.instructor).toEqual(mockUser); // Because it's an ObjectId
  expect(savedAssignment.createdAt).toBeDefined(); // Timestamp check
  expect(savedAssignment.submissions).toEqual([]); // Empty submissions array
});

test('should not create an assignment with missing required fields', async () => {
  const invalidAssignment = new Assignment({
    description: 'Missing assignment details.',
  });

  await expect(invalidAssignment.save()).rejects.toThrow(/Assignment validation failed/);
});
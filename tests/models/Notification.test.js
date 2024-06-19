import { expect, test,beforeAll,afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import Notification from '../../src/models/Notification'; 

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
  // Clear the notification collection after each test to avoid conflicts
  await Notification.deleteMany({});
});

test('should create a new notification', async () => {
  // Create a mock User object for the user reference (assuming User model exists)
  const mockUser = new mongoose.Types.ObjectId();

  const newNotification = new Notification({
    user: mockUser,
    message: 'You have a new message!',
  });

  await newNotification.save();

  const savedNotification = await Notification.findOne({ message: 'You have a new message!' });

  expect(savedNotification).not.toBeNull();
  expect(savedNotification.user).toEqual(mockUser); // Because it's an ObjectId
  expect(savedNotification.message).toBe('You have a new message!');
  expect(savedNotification.read).toBeFalsy(); // Default value check
  expect(savedNotification.createdAt).toBeDefined(); // Timestamp check
});

test('should not create a notification with missing required fields', async () => {
  const invalidNotification = new Notification({});

  await expect(invalidNotification.save()).rejects.toThrow(/Notification validation failed/);
});
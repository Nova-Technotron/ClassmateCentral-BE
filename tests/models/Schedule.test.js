import { expect, test,beforeAll,afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import Schedule from '../../src/models/Schedule';
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
  // Clear the schedule collection after each test to avoid conflicts
  await Schedule.deleteMany({});
});

test('should create a new schedule', async () => {
  const today = new Date();
  const oneHourLater = new Date(today.getTime() + 60 * 60 * 1000);

  const newSchedule = new Schedule({
    dayOfWeek: 'Tuesday',
    startTime: today,
    endTime: oneHourLater,
    courseName: 'Introduction to Algorithms',
  });

  await newSchedule.save();

  const savedSchedule = await Schedule.findOne({ courseName: 'Introduction to Algorithms' });

  expect(savedSchedule).not.toBeNull();
  expect(savedSchedule.dayOfWeek).toBe('Tuesday');
  expect(savedSchedule.startTime).toEqual(today); // Because it's a Date object
  expect(savedSchedule.endTime).toEqual(oneHourLater); // Because it's a Date object
  expect(savedSchedule.courseName).toBe('Introduction to Algorithms');
  expect(savedSchedule.createdAt).toBeDefined(); // Timestamp check
});

test('should not create a schedule with missing required fields', async () => {
  const invalidSchedule = new Schedule({
    courseName: 'Software Engineering',
  });

  await expect(invalidSchedule.save()).rejects.toThrow(/Schedule validation failed/);
});

test('should not create a schedule with an invalid dayOfWeek value', async () => {
  const invalidSchedule = new Schedule({
    dayOfWeek: 'InvalidDay',
    startTime: new Date(),
    endTime: new Date(),
    courseName: 'Data Structures',
  });

  await expect(invalidSchedule.save()).rejects.toThrow(/Schedule validation failed/);
});
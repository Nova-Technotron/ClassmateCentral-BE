import { expect, test,beforeAll,afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import Class from "../../src/models/Class.js"; 
import { announcementSchema } from '../../src/models/Announcement.js'; 
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
  // Clear the class collection after each test to avoid conflicts
  await Class.deleteMany({});
});

test('should create a new class', async () => {
  // Create a mock User object for the createdBy reference (assuming User model exists)
  const mockUser = new mongoose.Types.ObjectId();

  const newClass = new Class({
    className: 'Introduction to Programming',
    classCode: 'COMP101',
    createdBy: mockUser,
  });

  await newClass.save();

  const savedClass = await Class.findOne({ className: 'Introduction to Programming' });

  expect(savedClass).not.toBeNull();
  expect(savedClass.className).toBe('Introduction to Programming');
  expect(savedClass.classCode).toBe('COMP101');
  expect(savedClass.createdBy).toEqual(mockUser); // Because it's an ObjectId
  expect(savedClass.createdAt).toBeDefined(); // Timestamp check
  expect(savedClass.members).toEqual([]); // Empty members array
  expect(savedClass.announcements).toEqual([]); // Empty announcements array
});

test('should not create a class with a duplicate class code', async () => {
  await new Class({
    className: 'Software Engineering',
    classCode: 'SWE201',
    createdBy: new mongoose.Types.ObjectId(),
  }).save();

  const duplicateClass = new Class({
    className: 'Another Software Engineering Class',
    classCode: 'SWE201', // Duplicate class code
    createdBy: new mongoose.Types.ObjectId(),
  });

  await expect(duplicateClass.save()).rejects.toThrow(/duplicate key error/);
});

test('should create a class with an announcement', async () => {
  // Create a mock User object for the createdBy reference (assuming User model exists)
  const mockUser = new mongoose.Types.ObjectId();

  const announcement = {
    title: 'Welcome to the Class!',
    content: 'This is the first announcement for this class.',
    createdBy: new mongoose.Types.ObjectId()
  };

  const newClass = new Class({
    className: 'Web Development',
    classCode: 'WEB301',
    createdBy: mockUser,
    announcements: [announcement],
  });

  await newClass.save();

  const savedClass = await Class.findOne({ className: 'Web Development' });

  expect(savedClass.announcements.length).toBe(1);
  expect(savedClass.announcements[0].title).toBe('Welcome to the Class!');
  expect(savedClass.announcements[0].content).toBe('This is the first announcement for this class.');
});
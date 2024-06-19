import { expect, test,beforeAll,afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import Message from '../../src/models/Message'; // Replace with the path to your message model

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
  // Clear the message collection after each test to avoid conflicts
  await Message.deleteMany({});
});

test('should create a new message', async () => {
  // Create mock User objects for sender and recipient (assuming User model exists)
  const mockSender = new mongoose.Types.ObjectId();
  const mockRecipient = new mongoose.Types.ObjectId();

  const newMessage = new Message({
    sender: mockSender,
    recipient: mockRecipient,
    content: 'Hello from the other side!',
  });

  await newMessage.save();

  const savedMessage = await Message.findOne({ content: 'Hello from the other side!' });

  expect(savedMessage).not.toBeNull();
  expect(savedMessage.sender).toEqual(mockSender); // Because it's an ObjectId
  expect(savedMessage.recipient).toEqual(mockRecipient); // Because it's an ObjectId
  expect(savedMessage.content).toBe('Hello from the other side!');
  expect(savedMessage.read).toBeFalsy(); // Default value check
  expect(savedMessage.createdAt).toBeDefined(); // Timestamp check
});

test('should not create a message with missing required fields', async () => {
  const invalidMessage = new Message({
    content: 'Missing message details.',
  });

  await expect(invalidMessage.save()).rejects.toThrow(/Message validation failed/);
});
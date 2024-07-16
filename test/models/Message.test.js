import { expect, test, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import Message from "../../src/models/Message";

beforeAll(async () => {
  await mongoose.connect(import.meta.env.VITE_MONGODB_TEST, {});
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  await Message.deleteMany({});
});

test("should create a new message", async () => {
  const mockSender = new mongoose.Types.ObjectId();
  const mockRecipient = new mongoose.Types.ObjectId();

  const newMessage = new Message({
    sender: mockSender,
    recipient: mockRecipient,
    content: "Hello from the other side!",
  });

  await newMessage.save();

  const savedMessage = await Message.findOne({
    content: "Hello from the other side!",
  });

  expect(savedMessage).not.toBeNull();
  expect(savedMessage.sender).toEqual(mockSender);
  expect(savedMessage.recipient).toEqual(mockRecipient);
  expect(savedMessage.content).toBe("Hello from the other side!");
  expect(savedMessage.read).toBeFalsy();
  expect(savedMessage.createdAt).toBeDefined();
});

test("should not create a message with missing required fields", async () => {
  const invalidMessage = new Message({
    content: "Missing message details.",
  });

  await expect(invalidMessage.save()).rejects.toThrow(
    /Message validation failed/
  );
});

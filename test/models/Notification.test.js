import { expect, test, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import Notification from "../../src/models/Notification";

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
  await Notification.deleteMany({});
});

test("should create a new notification", async () => {
  const mockUser = new mongoose.Types.ObjectId();

  const newNotification = new Notification({
    title:"New Notification",
    user: mockUser,
    message: "You have a new message!",
  });

  await newNotification.save();

  const savedNotification = await Notification.findOne({
    message: "You have a new message!",
  });

  expect(savedNotification).not.toBeNull();
  expect(savedNotification.user).toEqual(mockUser);
  expect(savedNotification.title).toEqual("New Notification");
  expect(savedNotification.message).toBe("You have a new message!");
  expect(savedNotification.read).toBeFalsy();
  expect(savedNotification.createdAt).toBeDefined();
});

test("should not create a notification with missing required fields", async () => {
  const invalidNotification = new Notification({});

  await expect(invalidNotification.save()).rejects.toThrow(
    /Notification validation failed/
  );
});

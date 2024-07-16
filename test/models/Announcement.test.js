import { expect, test, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import Announcement from "../../src/models/Announcement";

// Connect to an in-memory MongoDB instance for testing
beforeAll(async () => {
   await mongoose.connect(import.meta.env.VITE_MONGODB_TEST, {});
});


afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
 
  await Announcement.deleteMany({});
});

test("should create a new announcement", async () => {
  
  const mockUser = new mongoose.Types.ObjectId();

  const newAnnouncement = new Announcement({
    title: "Important Update",
    content: "This is an important announcement for all users.",
    createdBy: mockUser,
  });

  await newAnnouncement.save();

  const savedAnnouncement = await Announcement.findOne({
    title: "Important Update",
  });

  expect(savedAnnouncement).not.toBeNull();
  expect(savedAnnouncement.title).toBe("Important Update");
  expect(savedAnnouncement.content).toBe(
    "This is an important announcement for all users."
  );
  expect(savedAnnouncement.createdBy).toEqual(mockUser); 
  expect(savedAnnouncement.createdAt).toBeDefined(); 
});

test("should not create an announcement with missing required fields", async () => {
  const invalidAnnouncement = new Announcement({
    content: "Missing announcement details.",
  });

  await expect(invalidAnnouncement.save()).rejects.toThrow(
    /Announcement validation failed/
  );
});

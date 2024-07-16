import { expect, test, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import Schedule from "../../src/models/Schedule";

beforeAll(async () => {
  await mongoose.connect(import.meta.env.VITE_MONGODB_TEST, {});
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  await Schedule.deleteMany({});
});

test("should create a new schedule", async () => {
  const today = new Date();
  const oneHourLater = new Date(today.getTime() + 60 * 60 * 1000);

  const newSchedule = new Schedule({
    dayOfWeek: "Tuesday",
    startTime: today,
    endTime: oneHourLater,
    courseName: "Introduction to Algorithms",
  });

  await newSchedule.save();

  const savedSchedule = await Schedule.findOne({
    courseName: "Introduction to Algorithms",
  });

  expect(savedSchedule).not.toBeNull();
  expect(savedSchedule.dayOfWeek).toBe("Tuesday");
  expect(savedSchedule.startTime).toEqual(today);
  expect(savedSchedule.endTime).toEqual(oneHourLater);
  expect(savedSchedule.courseName).toBe("Introduction to Algorithms");
  expect(savedSchedule.createdAt).toBeDefined();
});

test("should not create a schedule with missing required fields", async () => {
  const invalidSchedule = new Schedule({
    courseName: "Software Engineering",
  });

  await expect(invalidSchedule.save()).rejects.toThrow(
    /Schedule validation failed/
  );
});

test("should not create a schedule with an invalid dayOfWeek value", async () => {
  const invalidSchedule = new Schedule({
    dayOfWeek: "InvalidDay",
    startTime: new Date(),
    endTime: new Date(),
    courseName: "Data Structures",
  });

  await expect(invalidSchedule.save()).rejects.toThrow(
    /Schedule validation failed/
  );
});

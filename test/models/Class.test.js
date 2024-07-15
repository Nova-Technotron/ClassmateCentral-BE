import { expect, test, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import Class from "../../src/models/Class.js";

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
  await Class.deleteMany({});
});

test("should create a new class", async () => {
  const mockUser = new mongoose.Types.ObjectId();

  const newClass = new Class({
    className: "Introduction to Programming",
    classCode: "COMP101",
    createdBy: mockUser,
  });

  await newClass.save();

  const savedClass = await Class.findOne({
    className: "Introduction to Programming",
  });

  expect(savedClass).not.toBeNull();
  expect(savedClass.className).toBe("Introduction to Programming");
  expect(savedClass.classCode).toBe("COMP101");
  expect(savedClass.createdBy).toEqual(mockUser);
  expect(savedClass.createdAt).toBeDefined();
  expect(savedClass.members).toEqual([]);
  expect(savedClass.announcements).toEqual([]);
});

// test("should not create a class with a duplicate class code", async () => {
//   const classData= {
//     className: "Software Engineering",
//     classCode: "SWE201",
//     createdBy: new mongoose.Types.ObjectId(),
//   };
// await new Class(classData).save()
//   const duplicateClass = new Class({
//     className: "Another Software Engineering Class",
//     classCode: "SWE201",
//     createdBy: new mongoose.Types.ObjectId(),
//   });

//   await expect(duplicateClass.save()).rejects.toThrow(/duplicate key error/);
// });

test("should create a class with an announcement", async () => {
  const mockUser = new mongoose.Types.ObjectId();

  const announcement = {
    title: "Welcome to the Class!",
    content: "This is the first announcement for this class.",
    createdBy: new mongoose.Types.ObjectId(),
  };

  const newClass = new Class({
    className: "Web Development",
    classCode: "WEB301",
    createdBy: mockUser,
    announcements: [announcement],
  });

  await newClass.save();

  const savedClass = await Class.findOne({ className: "Web Development" });

  expect(savedClass.announcements.length).toBe(1);
  expect(savedClass.announcements[0].title).toBe("Welcome to the Class!");
  expect(savedClass.announcements[0].content).toBe(
    "This is the first announcement for this class."
  );
});

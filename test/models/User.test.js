// import { expect, test, beforeAll, afterAll, afterEach } from "vitest";
// import mongoose from "mongoose";
// import User from "../../src/models/User";

// beforeAll(async () => {
//   await mongoose.connect(import.meta.env.VITE_MONGODB_TEST, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
// });

// afterAll(async () => {
//   await mongoose.disconnect();
// });

// afterEach(async () => {
//   await User.deleteMany({});
// });

// test("should create a new user", async () => {
//   const newUser = new User({
//     username: "johndoe",
//     firstName: "John",
//     lastName: "Doe",
//     email: "johndoe@example.com",
//     password: "securepassword",
//   });

//   await newUser.save();

//   const savedUser = await User.findOne({ username: "johndoe" });

//   expect(savedUser).not.toBeNull();
//   expect(savedUser.username).toBe("johndoe");
//   expect(savedUser.firstName).toBe("John");
//   expect(savedUser.lastName).toBe("Doe");
//   expect(savedUser.email).toBe("johndoe@example.com");

//   expect(savedUser.password).toBe("securepassword");
//   expect(savedUser.isAdmin).toBeFalsy();
// });



// test("should not create a user with a missing required field", async () => {
//   const invalidUser = new User({
//     email: "missinguser@example.com",
//     password: "nopassword",
//   });

//   await expect(invalidUser.save()).rejects.toThrow(/User validation failed/);
// });

// test('should have a default isAdmin value of false', async () => {
//   const userData = {
//     username: "janedoe",
//     firstName: "Jane",
//     lastName: "Doe",
//     email: "janedoe@example.com",
//     password: "securepassword",
//   };

//   const user = new User(userData);
//   const savedUser = await user.save();

//   expect(savedUser.isAdmin).toBe(false);
// });
// test('should not create a user with a duplicate username', async () => {
//   const userData = {
//     username: "janedoe",
//     firstName: "Jane",
//     lastName: "Doe",
//     email: "janedoe@example.com",
//     password: "securepassword",
//   };

//   await new User(userData).save();

//   const duplicateUser = new User({
//     username: "janedoe",
//     firstName: "Another",
//     lastName: "Doe",
//     email: "anotherjanedoe@example.com",
//     password: "duplicatepassword",
//   });

//   try {
//     await duplicateUser.save();
//   } catch (error) {
//     console.error('Error message:', error.message); // Log the error message
//     expect(error.message).toMatch(/E11000 duplicate key error/);
//   }
// });

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import User from '../../src/models/User'; 

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testdb', { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Clear the database before each test
  beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });

  it('should create and save a user successfully', async () => {
    const userData = {
      username: "janedoe",
      firstName: "Jane",
      lastName: "Doe",
      email: "janedoe@example.com",
      password: "securepassword",
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(userData.username);
    expect(savedUser.firstName).toBe(userData.firstName);
    expect(savedUser.lastName).toBe(userData.lastName);
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.password).toBe(userData.password);
    expect(savedUser.isAdmin).toBe(false); // default value
  });

  it('should not create a user with a duplicate username', async () => {
    const userData = {
      username: "janedoe",
      firstName: "Jane",
      lastName: "Doe",
      email: "janedoe@example.com",
      password: "securepassword",
    };

    await new User(userData).save();

    const duplicateUser = new User({
      username: "janedoe",
      firstName: "Another",
      lastName: "Doe",
      email: "anotherjanedoe@example.com",
      password: "duplicatepassword",
    });

    try {
      await duplicateUser.save();
    } catch (error) {
      console.error('Error message:', error.message); // Log the error message
      expect(error.message).toMatch(/E11000 duplicate key error/);
    }
  });

  it('should not create a user with a duplicate email', async () => {
    const userData = {
      username: "janedoe",
      firstName: "Jane",
      lastName: "Doe",
      email: "janedoe@example.com",
      password: "securepassword",
    };

    await new User(userData).save();

    const duplicateUser = new User({
      username: "anotherjanedoe",
      firstName: "Another",
      lastName: "Doe",
      email: "janedoe@example.com",
      password: "duplicatepassword",
    });

    try {
      await duplicateUser.save();
    } catch (error) {
      console.error('Error message:', error.message); // Log the error message
      expect(error.message).toMatch(/E11000 duplicate key error/);
    }
  });

  it('should require all required fields', async () => {
    const user = new User();

    const error = await user.validateSync();
    expect(error.errors.username).toBeDefined();
    expect(error.errors.firstName).toBeDefined();
    expect(error.errors.lastName).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  it('should have a default isAdmin value of false', async () => {
    const userData = {
      username: "janedoe",
      firstName: "Jane",
      lastName: "Doe",
      email: "janedoe@example.com",
      password: "securepassword",
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.isAdmin).toBe(false);
  });
});

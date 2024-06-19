import { expect, test,beforeAll,afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import User from '../../src/models/User'; 
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
  // Clear the user collection after each test to avoid conflicts
  await User.deleteMany({});
});

test('should create a new user', async () => {
  const newUser = new User({
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@example.com',
    password: 'securepassword',
  });

  await newUser.save();

  const savedUser = await User.findOne({ username: 'johndoe' });

  expect(savedUser).not.toBeNull();
  expect(savedUser.username).toBe('johndoe');
  expect(savedUser.firstName).toBe('John');
  expect(savedUser.lastName).toBe('Doe');
  expect(savedUser.email).toBe('johndoe@example.com');
  // Password should not be directly compared due to hashing
  expect(savedUser.password).toBe('securepassword');
  expect(savedUser.isAdmin).toBeFalsy();
});

test('should not create a user with a duplicate username', async () => {
  await new User({
    username: 'janedoe',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'janedoe@example.com',
    password: 'anotherpassword',
  }).save();

  const duplicateUser = new User({
    username: 'janedoe', // Duplicate username
    firstName: 'Another',
    lastName: 'Doe',
    email: 'anotherjanedoe@example.com',
    password: 'duplicatepassword',
  });

  await expect(duplicateUser.save()).rejects.toThrow(/duplicate key error/);
});

test('should not create a user with a missing required field', async () => {
  const invalidUser = new User({
    email: 'missinguser@example.com',
    password: 'nopassword',
  });

  await expect(invalidUser.save()).rejects.toThrow(/User validation failed/);
});
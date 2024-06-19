

import {
  describe,
  it,
  expect,
  afterAll,
  beforeAll,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import sinon from 'sinon';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../../src/models/User.js';
import app  from "../../src/server.js"; // Import your Express app instance

describe('Auth Controller', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = { username: 'testuser', email: 'test@example.com', password: 'password' };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      sandbox.stub(User, 'findOne').resolves(null);
      sandbox.stub(User.prototype, 'save').resolves({});

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('message').that.equals('User registered successfully');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      const userData = { email: 'test@example.com', password: 'password' };
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      sandbox.stub(User, 'findOne').resolves({ email: userData.email, password: hashedPassword });

      const res = await request(app)
        .post('/api/auth/login')
        .send(userData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('should return 400 if email is not found', async () => {
      const userData = { email: 'test@example.com', password: 'password' };
      sandbox.stub(User, 'findOne').resolves(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send(userData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message').that.equals('Invalid credentials');
    });

    it('should return 400 if password is incorrect', async () => {
      const userData = { email: 'test@example.com', password: 'incorrectpassword' };
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      sandbox.stub(User, 'findOne').resolves({ email: userData.email, password: hashedPassword });

      const res = await request(app)
        .post('/api/auth/login')
        .send(userData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message').that.equals('Invalid credentials');
    });
  });

  describe('PUT /api/auth/password', () => {
    it('should change user password with valid credentials', async () => {
      const userData = { currentPassword: 'oldpassword', newPassword: 'newpassword' };
      const user = new User({ id: '123', password: await bcrypt.hash('oldpassword', 10) });
      sandbox.stub(User, 'findById').resolves(user);
      sandbox.stub(user, 'save').resolves(user);

      const res = await request(app)
        .put('/api/auth/password')
        .send(userData);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message').that.equals('Password changed successfully');
    });

    it('should return 400 if current password is incorrect', async () => {
      const userData = { currentPassword: 'wrongpassword', newPassword: 'newpassword' };
      const user = new User({ id: '123', password: await bcrypt.hash('oldpassword', 10) });
      sandbox.stub(User, 'findById').resolves(user);

      const res = await request(app)
        .put('/api/auth/cpassword')
        .send(userData);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message').that.equals('Invalid current password');
    });
  });

  // Write similar tests for forgotPassword and resetPassword functions
});
import { expect } from 'chai';
import sinon from 'sinon';
import supertest from 'supertest';
import app from '../app'; // Assuming your Express app setup is in app.js

describe('Schedule Controller', () => {
    describe('GET /api/schedules', () => {
        it('should return an array of schedules', async () => {
            // Define a mock schedule array
            const mockSchedules = [{ id: 1, title: 'Schedule 1' }, { id: 2, title: 'Schedule 2' }];

            // Stub the Schedule model's find method to return the mock schedule array
            const Schedule = require('../models/Schedule'); // Assuming Schedule model is in models directory
            const findStub = sinon.stub(Schedule, 'find').resolves(mockSchedules);

            // Make a GET request to the /api/schedules endpoint
            const response = await supertest(app).get('/api/schedules');

            // Assert that the response status is 200
            expect(response.status).to.equal(200);

            // Assert that the response body is an array of schedules
            expect(response.body).to.be.an('array');
            expect(response.body).to.have.lengthOf(2);
            expect(response.body[0]).to.deep.equal({ id: 1, title: 'Schedule 1' });
            expect(response.body[1]).to.deep.equal({ id: 2, title: 'Schedule 2' });

            // Restore the stub after the test
            findStub.restore();
        });
    });
    describe('POST /api/schedules', () => {
        it('should create a new schedule', async () => {
            // Stub the Schedule model's create method to return the mock schedule
            const Schedule = require('../models/Schedule');
            const createStub = sinon.stub(Schedule, 'create').resolves(mockSchedule);

            // Make a POST request to the /api/schedules endpoint with mock data
            const response = await supertest(app)
                .post('/api/schedules')
                .send({ title: 'Schedule 1' });

            // Assert that the response status is 201 (created)
            expect(response.status).to.equal(201);

            // Assert that the response body matches the mock schedule
            expect(response.body).to.deep.equal(mockSchedule);

            // Restore the stub after the test
            createStub.restore();
        });
    });

    describe('PUT /api/schedules/:id', () => {
        it('should update an existing schedule', async () => {
            // Stub the Schedule model's findByIdAndUpdate method to return the updated schedule
            const Schedule = require('../models/Schedule');
            const findByIdAndUpdateStub = sinon.stub(Schedule, 'findByIdAndUpdate').resolves(mockSchedule);

            // Make a PUT request to the /api/schedules/:id endpoint with mock data
            const response = await supertest(app)
                .put(`/api/schedules/${mockSchedule.id}`)
                .send({ title: 'Updated Schedule 1' });

            // Assert that the response status is 200
            expect(response.status).to.equal(200);

            // Assert that the response body matches the updated schedule
            expect(response.body).to.deep.equal(mockSchedule);

            // Restore the stub after the test
            findByIdAndUpdateStub.restore();
        });
    });

    describe('DELETE /api/schedules/:id', () => {
        it('should delete an existing schedule', async () => {
            // Stub the Schedule model's findByIdAndDelete method to return the deleted schedule
            const Schedule = require('../models/Schedule');
            const findByIdAndDeleteStub = sinon.stub(Schedule, 'findByIdAndDelete').resolves(mockSchedule);

            // Make a DELETE request to the /api/schedules/:id endpoint
            const response = await supertest(app).delete(`/api/schedules/${mockSchedule.id}`);

            // Assert that the response status is 204 (no content)
            expect(response.status).to.equal(204);

            // Assert that the response body is empty
            expect(response.body).to.be.empty;

            // Restore the stub after the test
            findByIdAndDeleteStub.restore();
        });
    });
});

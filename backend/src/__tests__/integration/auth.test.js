import request from 'supertest';
import app from '../../app.js';
import User from '../../models/User.js';
import { resetAuthRateLimits } from '../../middleware/rateLimit.middleware.js';

const NGO_USER = {
    name: 'Integration NGO',
    email: 'integration_ngo@test.com',
    password: 'Ngo@123456',
    role: 'NGO',
    organizationName: 'Test NGO Org',
};

const INVESTIGATOR_USER = {
    name: 'Integration Investigator',
    email: 'integration_inv@test.com',
    password: 'Inv@123456',
    role: 'INVESTIGATOR',
    nic: '199001012345',
    dob: '1990-01-01',
};

describe('Auth Routes - Integration', () => {
    beforeEach(() => {
        resetAuthRateLimits();
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register an NGO user and return 201 with token', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(NGO_USER);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user.role).toBe('NGO');
        });

        it('should return 400 when self-registering as INVESTIGATOR', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(INVESTIGATOR_USER);

            expect(res.status).toBe(400);
        });

        it('should return 400 when self-registering as ADMIN', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ name: 'Attacker', email: 'attacker@test.com', password: 'Attack@12345', role: 'ADMIN' });

            expect(res.status).toBe(400);
        });

        it('should return 400 when email is already registered', async () => {
            await request(app).post('/api/v1/auth/register').send(NGO_USER);

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(NGO_USER);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 400 when required fields are missing', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ email: 'incomplete@test.com' });

            expect(res.status).toBe(400);
        });

        it('should return 400 when NGO user missing organizationName', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ name: 'NGO', email: 'ngo2@test.com', password: 'Ngo@123456', role: 'NGO' });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Seed a user for login tests
            await request(app).post('/api/v1/auth/register').send(NGO_USER);
        });

        it('should return 200 with token on valid credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: NGO_USER.email, password: NGO_USER.password });

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveProperty('token');
        });

        it('should return 401 for wrong password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: NGO_USER.email, password: 'WrongPassword' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should return 401 for non-existent email', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'nobody@test.com', password: 'somepass' });

            expect(res.status).toBe(401);
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'not-an-email', password: 'somepass' });

            expect(res.status).toBe(400);
        });

        it('should return the generic 401 message for a deactivated account', async () => {
            await User.updateOne({ email: NGO_USER.email }, { isActive: false });

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: NGO_USER.email, password: NGO_USER.password });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });

        it('should return 429 after repeated failed login attempts', async () => {
            for (let i = 0; i < 10; i++) {
                await request(app)
                    .post('/api/v1/auth/login')
                    .send({ email: NGO_USER.email, password: 'WrongPassword' });
            }

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: NGO_USER.email, password: NGO_USER.password });

            expect(res.status).toBe(429);
            expect(res.headers).toHaveProperty('ratelimit-policy');
        });
    });

    describe('password policy', () => {
        it('should return 400 for a 6-character password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ ...NGO_USER, password: 'Ab@123' });

            expect(res.status).toBe(400);
        });

        it('should return 400 for a long password without complexity', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ ...NGO_USER, password: 'passwordpassword' });

            expect(res.status).toBe(400);
        });
    });
});

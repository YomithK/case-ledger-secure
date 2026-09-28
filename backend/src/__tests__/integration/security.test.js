import request from 'supertest';
import app from '../../app.js';

describe('Security hardening (V11) - Integration', () => {
    it('should not expose the X-Powered-By header', async () => {
        const res = await request(app).get('/health');

        expect(res.status).toBe(200);
        expect(res.headers).not.toHaveProperty('x-powered-by');
    });

    it('should set helmet security headers', async () => {
        const res = await request(app).get('/health');

        expect(res.headers).toHaveProperty('content-security-policy');
        expect(res.headers).toHaveProperty('strict-transport-security');
        expect(res.headers['x-content-type-options']).toBe('nosniff');
        expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('should allow CORS for the configured frontend origin', async () => {
        const res = await request(app).get('/health').set('Origin', 'http://localhost:5173');

        expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should not reflect an untrusted Origin', async () => {
        const res = await request(app).get('/health').set('Origin', 'http://evil.example');

        expect(res.headers).not.toHaveProperty('access-control-allow-origin');
    });

    it('should not allow a CORS preflight from an untrusted Origin', async () => {
        const res = await request(app)
            .options('/api/v1/cases')
            .set('Origin', 'http://evil.example')
            .set('Access-Control-Request-Method', 'DELETE');

        expect(res.headers).not.toHaveProperty('access-control-allow-origin');
    });
});

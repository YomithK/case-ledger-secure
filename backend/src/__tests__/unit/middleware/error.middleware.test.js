import { errorHandler } from '../../../middleware/error.middleware.js';

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('error middleware', () => {
    it('should not return raw error messages for unexpected 500 errors', () => {
        const res = mockRes();
        const err = new Error('connect ECONNREFUSED 10.0.0.5:27017 - internal detail');

        errorHandler(err, {}, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error' });
    });

    it('should still return the message for client (4xx) errors', () => {
        const res = mockRes();
        const err = new Error('Case not found');
        err.statusCode = 404;

        errorHandler(err, {}, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Case not found' });
    });
});

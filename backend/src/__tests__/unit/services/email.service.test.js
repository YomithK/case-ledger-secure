const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });

jest.mock('nodemailer', () => ({
    __esModule: true,
    default: {
        createTransport: jest.fn(() => ({ sendMail: mockSendMail })),
    },
}));

import {
    escapeHtml,
    sendInvestigatorAssignmentEmail,
    sendVictimProgressUpdateEmail,
} from '../../../services/email.service.js';

describe('email service', () => {
    beforeAll(() => {
        process.env.EMAIL_USER = 'sender@test.com';
        process.env.EMAIL_PASS = 'test';
    });

    afterAll(() => {
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASS;
    });

    beforeEach(() => jest.clearAllMocks());

    describe('escapeHtml', () => {
        it('should encode HTML special characters', () => {
            expect(escapeHtml(`<a href="x">'&'</a>`))
                .toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
        });

        it('should return an empty string for null/undefined', () => {
            expect(escapeHtml(undefined)).toBe('');
            expect(escapeHtml(null)).toBe('');
        });
    });

    describe('templates', () => {
        const payload = '<a href="http://evil.example">Click here</a>';

        it('should render a malicious case title and name as text in the assignment email', async () => {
            await sendInvestigatorAssignmentEmail({
                investigatorEmail: 'inv@test.com',
                investigatorName: '<b>Inv</b>',
                caseTitle: payload,
                caseNumber: 'CL-0001',
                caseId: '507f1f77bcf86cd799439011',
            });

            const { html } = mockSendMail.mock.calls[0][0];
            expect(html).not.toContain(payload);
            expect(html).not.toContain('<b>Inv</b>');
            expect(html).toContain('&lt;a href=&quot;http://evil.example&quot;&gt;Click here&lt;/a&gt;');
        });

        it('should render a malicious progress message as text in the victim update email', async () => {
            await sendVictimProgressUpdateEmail({
                victimEmail: 'victim@test.com',
                victimName: 'Victim',
                caseTitle: 'Case',
                caseNumber: 'CL-0001',
                caseId: '507f1f77bcf86cd799439011',
                progressMessage: payload,
                newStatus: 'UNDER_INVESTIGATION',
            });

            const { html } = mockSendMail.mock.calls[0][0];
            expect(html).not.toContain(payload);
            expect(html).toContain('&lt;a href=');
        });
    });
});

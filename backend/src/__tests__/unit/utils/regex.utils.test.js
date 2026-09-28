import { escapeRegex } from '../../../utils/regex.utils.js';

describe('regex utils', () => {
    describe('escapeRegex', () => {
        it('should escape all regex metacharacters', () => {
            expect(escapeRegex('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
        });

        it('should leave plain text unchanged', () => {
            expect(escapeRegex('John Doe')).toBe('John Doe');
        });

        it('should make .* match only the literal string', () => {
            const re = new RegExp(escapeRegex('.*'), 'i');
            expect(re.test('anything')).toBe(false);
            expect(re.test('literal .* text')).toBe(true);
        });

        it('should neutralise catastrophic-backtracking patterns', () => {
            const re = new RegExp(escapeRegex('(a+)+$'));
            expect(re.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa!')).toBe(false);
        });

        it('should coerce non-string input to a string', () => {
            expect(escapeRegex(['a.b', 'c'])).toBe('a\\.b,c');
        });
    });
});

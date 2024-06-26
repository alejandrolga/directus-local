// src/sqlValidator.js
class SQLValidator {
    constructor() {
        this.forbiddenKeywords = [
            'ALTER TABLE',
            'UPDATE',
            'DELETE',
            'INSERT INTO',
            'CREATE DATABASE',
            'DROP DATABASE',
            'BACKUP DATABASE',
            'CREATE TABLE',
            'DROP TABLE',
            'TRUNCATE',
            'EXEC',
            'EXECUTE',
            'INSERT',
            'UPDATE',
            'DELETE',
            'DROP',
            'TRUNCATE',
            'ALTER',
            'CREATE',
            'EXECUTE',
            'GRANT',
            'REVOKE'
        ];
        this.regex = new RegExp(this.forbiddenKeywords.map(word => `\\b${word}\\b`).join('|'), 'i');
    }

    validate(query) {
        if (this.regex.test(query)) {
            throw new Error('Query contains forbidden operations.');
        }
    }
}

export default SQLValidator;

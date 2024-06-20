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
            'EXECUTE'
        ];
        this.regex = new RegExp(this.forbiddenKeywords.join('|'), 'i');
    }

    validate(query) {
        if (this.regex.test(query)) {
            throw new Error('Query contains forbidden operations.');
        }
    }
}

export default SQLValidator;

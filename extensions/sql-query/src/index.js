// src/index.js
import SQLValidator from './sqlValidator.js';

export default {
    id: 'request',
    handler: async (router, { database, logger }) => {
        const sqlValidator = new SQLValidator();

        router.post('/7kQ9dF2vX6bM3rL8wA4jZ5nH1pT0cY7', async (req, res) => {
            try {
                const { variable } = req.body;

                sqlValidator.validate(variable);

                const result = await database.raw(variable);
                logger.info('SQL Query Result:', result);

                const data = result.rows ? result.rows : result;

                logger.info('Processed Result Data:', data);
                res.json(data);

            } catch (error) {
                logger.error('Custom SQL query failed', error);
                res.status(500).send('Custom SQL query failed');
            }
        });
    },
};

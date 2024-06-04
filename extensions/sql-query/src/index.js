// src/index.js
export default {
    id: 'my-extension',
    handler: async (router, { database, services, getSchema, env, logger, emitter, ColeccionService }) => {
        // Ruta básica de ejemplo
        router.get('/', (req, res) => {
            res.send('Hello, World!');
        });

        // Ruta que utiliza Knex para interactuar con la base de datos
        router.get('/itemsByCollection', async (req, res) => {
            try {
                // Utiliza la instancia de Knex para hacer una consulta a la base de datos
                const users = await database('motion_graphic');
                res.json(users);
            } catch (error) {
                // Manejo de errores
                logger.error('Database query failed', error);
                res.status(500).send('Database query failed');
            }
        });

        // Ruta que utiliza una consulta SQL personalizada
        router.get('/query', async (req, res) => {
            try {
                // Ejemplo de una consulta SQL personalizada
                const result = await database.raw(`
				SELECT * FROM motion_graphic;
				`);
                logger.info('SQL Query Result:', result); // Log para depuración

                // Verifica si result tiene la propiedad rows o si es un arreglo
                const data = result.rows ? result.rows : result;

                logger.info('Processed Result Data:', data); // Log para depuración
                res.json(data);

            } catch (error) {
                // Manejo de errores
                logger.error('Custom SQL query failed', error);
                res.status(500).send('Custom SQL query failed');
            }
        });

        // Ruta que utiliza una consulta SQL personalizada
        router.post('/post', async (req, res) => {
            try {
                const { variable } = req.body;

                // Ejemplo de una consulta SQL personalizada
                const result = await database.raw(variable);
                logger.info('SQL Query Result:', result); // Log para depuración

                // Verifica si result tiene la propiedad rows o si es un arreglo
                const data = result.rows ? result.rows : result;

                logger.info('Processed Result Data:', data); // Log para depuración
                res.json(data);

            } catch (error) {
                // Manejo de errores
                logger.error('Custom SQL query failed', error);
                res.status(500).send('Custom SQL query failed');
            }
        });
    },
};

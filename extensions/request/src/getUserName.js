import { createDirectus, rest, readUser } from '@directus/sdk';

const client = createDirectus('http://0.0.0.0:8055/').with(rest());

async function getUserName(userId) {
    try {
        const user = await client.request(
            readUser(userId, {
                fields: ['first_name', 'last_name']
            })
        );
        if (user && user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`;
        } else {
            console.error(`User data incomplete for ${userId}:`, user);
            return 'Unknown User';
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        return 'Unknown User';
    }
}

export { getUserName };

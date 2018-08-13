module.exports = function (db) {
    const userActivationQuery = 'update the_user set active = $1, activated_at = $2 where id in ($3:csv)';
    const adminManagementQuery = 'update the_user set admin = $1 where id in ($2:csv)';

    async function exist (username) {
        const query = 'select count(*) from the_user where user_name = $/username/';
        const result = await db.one(query, {
            username
        });
        return Number(result.count) === 1;
    }

    async function findByUsername (username) {
        const query = 'select * from the_user where user_name = $/username/';
        const user = await db.one(query, {
            username
        });
        return user;
    }

    async function createUser (details) {
        const query = 'insert into the_user (user_name, full_name, joined_at, active, admin) values ($/username/, $/fullName/, $/joined_at/, false, false)';
        details.joined_at = new Date();
        await db.none(query, details);
    }

    async function activateAll (userIds) {
        await db.none(userActivationQuery, [true, new Date(), userIds]);
    }

    async function deactivateAll (userIds) {
        await db.none(userActivationQuery, [false, new Date(), userIds]);
    }

    async function makeAdmin (userIds) {
        await db.none(adminManagementQuery, [true, userIds]);
    }

    async function removeAdmin (userIds) {
        await db.none(adminManagementQuery, [false, userIds]);
    }

    async function findOrCreateUser (profile) {
        const userExists = await exist(profile.username);
        if (!userExists) {
            await createUser({
                username: profile.username,
                fullName: profile.displayName
            });
        }
        const currentUser = await findByUsername(profile.username);
        currentUser.newUser = !userExists;
        return currentUser;
    }

    async function list () {
        return db.any('select * from the_user order by full_name');
    }

    return {
        activateAll,
        deactivateAll,
        makeAdmin,
        removeAdmin,
        findByUsername,
        createUser,
        exist,
        findOrCreateUser,
        list
    };
};

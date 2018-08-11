module.exports = function(db) {

    async function exist(username) {
        const query = 'select count(*) from the_user where user_name = ${username}';
        const result = await db.one(query, {
            username
        });
        return Number(result.count) === 1;
    }

    async function findByUsername(username) {
        const query = 'select * from the_user where user_name = ${username}';
        const user = await db.one(query, {
            username
        });
        return user;
    }

    async function createUser(details) {
        const query = 'insert into the_user (user_name, full_name, active, admin) values (${username}, ${fullName}, false, false)';
        await db.none(query, details);
    }

    return {
        findByUsername,
        createUser,
        exist

    }



}
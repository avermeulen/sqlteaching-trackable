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

    async function createUser(username) {
        const query = 'insert into the_user (user_name, active, admin) values (${username}, false, false)';
        const user = await db.none(query, {
            username
        });
    }

    return {
        findByUsername,
        createUser,
        exist

    }



}
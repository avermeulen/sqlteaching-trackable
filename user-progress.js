module.exports = function(db) {
    async function record(params) {
        const result = await db.one('select count(*) from user_progress where user_name = ${user_name} and task_name = ${task_name}', params);
        if (Number(result.count) === 0) {
            await db.none('insert into user_progress (user_name, task_name) values (${user_name}, ${task_name})', params);
        }
    }

    return {
        record
    }

}
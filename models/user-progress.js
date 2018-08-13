module.exports = function (db) {
    async function record (params) {
        params.completed_at = new Date();
        const result = await db.one('select count(*) from user_progress where user_name = $/user_name / and task_name = $/task_name/', params);
        if (Number(result.count) === 0) {
            await db.none(`insert into user_progress (user_name, task_name, completed_at) 
                values ($/user_name/, $/task_name/, $/completed_at/)`, params);
        }
    }

    async function overview () {
        const query = `select full_name, user_progress.user_name, 
                round(count(*)/31.00, 2)*100 as progress 
            from 
                user_progress join the_user on the_user.user_name = user_progress.user_name 
            group by 
                full_name,user_progress.user_name`;
        return db.any(query);
    }

    return {
        record,
        overview
    };
};

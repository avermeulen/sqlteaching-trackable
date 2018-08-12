module.exports = function (userProgress) {
    async function overview (req, res) {
        const progressList = await userProgress.overview();
        res.render('progress', {progressList});
    }

    async function trackProgress (req, res) {
        if (!req.isAuthenticated()) {
            return res.json({
                status: 'access-denied'
            });
        }
        const taskName = req.body.task;
        const userName = req.user.user_name;
        try {
            const params = {
                user_name: userName,
                task_name: taskName
            };
            await userProgress.record(params);
            return res.json({
                status: 'success'
            });
        } catch (error) {
            return res.json({
                status: 'error',
                error
            });
        }
    }

    return {
        overview,
        trackProgress
    };
};

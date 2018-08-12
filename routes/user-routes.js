module.exports = function (user) {

    const ACTIVATE_USER = 'activate';
    const DEACTIVATE_USER = 'deactivate';
    const MAKE_ADMIN = 'make_admin';
    const REMOVE_ADMIN = 'remove_admin';

    const actions = [{
        code: ACTIVATE_USER,
        desc: 'Activate user'
    }, {
        code: DEACTIVATE_USER,
        desc: 'Deactivate user'
    }, {
        code: MAKE_ADMIN,
        desc: 'Make administrator'
    }, {
        code: REMOVE_ADMIN,
        desc: 'Remove as administrator'
    }
    ];

    async function list (req, res) {
        const users = await user.list();
        res.render('users', { users, actions });
    };

    async function update (req, res, next) {
        console.log(req.body);

        try {
            const action = req.body.action;
            const selectedUserIds = Array.isArray(req.body.selected) ? req.body.selected : [req.body.selected];

            switch (action) {
            case ACTIVATE_USER:
                await user.activateAll(selectedUserIds);
                break;
            case DEACTIVATE_USER:
                await user.deactivateAll(selectedUserIds);
                break;
            case REMOVE_ADMIN:
                await user.removeAdmin(selectedUserIds);
                break;
            case MAKE_ADMIN:
                await user.makeAdmin(selectedUserIds);
                break;
            }
            
            res.redirect('/users');
        } catch (err) {
            next(err);
        }
    }

    return {
        list,
        update
    };
};

const ADMIN_LIST = [{ email: 'dekitarpg@gmail.com' }];

module.exports = function checkIsAdmin(user) {
    if (!user) return false;
    for (const admin of ADMIN_LIST) {
        if (admin.email && user.email === admin.email) return true;
        if (admin.id && user.id === admin.id) return true;
    }
    return false;
};

const Users = require("../../models/Users");
const Sessions = require("../../models/Sessions");

const myAccount = async (req, res) => {
    const sessions = await Sessions.find({
        session: { $regex: req.user._id, $options: 'i' },
        expires: { $gt: Date.now() }
    });
    let hasPassword = false

    const user = await Users.findById(req.user._id).select('+password +code');
    if(user?.password){
        hasPassword = true
    }

    const parsedSessions = sessions.map(doc => {
        const sessionData = JSON.parse(doc.session);
        sessionData.lastActive = new Date(sessionData.lastActive);

        return {
            _id: doc._id,
            expires: doc.expires,
            session: sessionData,
            isCurrent: doc._id.toString() === req.sessionID
        };
    }).sort((a, b) => b.isCurrent - a.isCurrent);;

    res.render('pages/myAccount', { user: req.user, sessions: parsedSessions, hasPassword });
}

module.exports = myAccount;
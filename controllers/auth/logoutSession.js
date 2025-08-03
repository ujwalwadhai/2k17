const Users = require("../../models/Users");
const Sessions = require("../../models/Sessions");

const logoutSession = async (req, res) => {
    const session = await Sessions.findByIdAndDelete(req.params.sessionId);
}

module.exports = logoutSession;
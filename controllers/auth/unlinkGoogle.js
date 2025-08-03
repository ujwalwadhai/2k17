const Users = require("../../models/Users");

const unlinkGoogle = async (req, res) => {
    const session = await Users.findByIdAndUpdate(req.user._id, {
        $unset: { googleId: "" },
    });
}

module.exports = unlinkGoogle;
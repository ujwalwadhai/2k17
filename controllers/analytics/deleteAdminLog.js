const DailyUsers = require('../../models/DailyUsers');
const ActiveUsers = require('../../models/ActiveUsers');

const deleteAdminLog = async (req, res) => {
  try {
    let payload;
    try {
      payload = JSON.parse(req.body);
    } catch (err) {
      return res.sendStatus(400);
    }
    await DailyUsers.deleteOne({ session_id: payload.sessionId });
    await ActiveUsers.deleteOne({ session_id: payload.sessionId });
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }

};

module.exports = deleteAdminLog;
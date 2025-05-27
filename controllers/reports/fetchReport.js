var Reports = require("../../models/Reports");

const fetchReport = async (req, res) => {
  try{
    var report = await Reports.findOne({ _id: req.params.id }).populate("user", "username");
    if(!report) return res.status(404).json({success: false, message: 'Report not found'});
    res.json({success: true, report});
  } catch(err){
    console.log(err);
    res.status(500).json({success: false, message: 'Something went wrong.'});
  }
}

module.exports = fetchReport;
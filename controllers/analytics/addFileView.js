const PageViews = require('../../models/PageViews');

const addFileView = async (req, res) => {
    try {
        let payload;
        try {
            payload = JSON.parse(req.body);
        } catch (err) {
            return res.sendStatus(400);
        }
        if (!payload.fileId) return res.sendStatus(400);
        if(!req.user) return
        const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });
        if(req.user.role == "admin") return
        await PageViews.findOneAndUpdate(
            { route: `/memories/file/${payload.fileId}`, date },
            { $inc: { visits: 1 } },
            { upsert: true }
        );
        // User can be tracked too by req.user
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }

};

module.exports = addFileView;
var Files = require('../../models/Files');
var mongoose = require('mongoose');

var likeFile = async (req, res) => {
    const { fileId } = req.params;
    const userId = req.user?._id;

    try {
        const file = await Files.findById(fileId);

        if (!file) {
            return res.status(404).json({success:false, message: 'File not found' });
        }

        if(!userId){
            return res.status(401).json({success:false, message: 'User not authenticated' });
        }

        if (file.likes.includes(userId)) {
            await Files.updateOne({_id: fileId}, { $pull: { likes: userId } });
            return res.status(200).json({success:true, liked: false, message: 'File unliked successfully' });
        } else {
            if(!file.likes){
                file.likes = []
            }
            file.likes.push(userId);
            await file.save();
            return res.status(200).json({success: true, liked: true, message: 'File liked successfully' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({success:false, message: 'Internal server error' });
    }
}

module.exports = likeFile;
const ActiveUsers = require('../../models/ActiveUsers');
const Posts = require('../../models/Posts');
const Users = require('../../models/Users');
const DailyUsers = require('../../models/DailyUsers');
const Files = require('../../models/Files');
const Folders = require('../../models/Folders');

var onlineUsers = async (req, res) => {
  const since = new Date(Date.now() - 20000);

  const activeUsers = await ActiveUsers.find({ last_ping: { $gte: since } })
    .select('user current_route')
    .populate('user', 'name username');

  for (let user of activeUsers) {
    if (/^\/post\/[a-fA-F0-9]{24}$/.test(user.current_route)) {
      const postId = user.current_route.split('/')[2];
      const post = await Posts.findById(postId).populate('author', 'name');
      user._doc.postOwnerName = post?.author?.name ? post.author.name.split(' ')[0] + ' ' + post.author.name.split(' ')[1][0] + '.' : null;
    } else if (/^\/[a-zA-Z0-9_]+$/.test(user.current_route)) {
      const username = user.current_route.slice(1);
      const owner = await Users.findOne({ username }).select('name');
      user._doc.profileOwnerName = owner?.name ? owner.name.split(' ')[0] + ' ' + owner.name.split(' ')[1][0] + '.' : null;
    } else if (/^\/memories\/file\//.test(user.current_route)) {
      const fileId = user.current_route.split('/')[3];
      const file = await Files.findById(fileId).select('name');
      user._doc.file = file;
    } else if (/^\/memories\/folder\//.test(user.current_route)) {
      const folderId = user.current_route.split('/')[3];
      const folder = await Folders.findById(folderId).select('name');
      user._doc.folder = folder;
    }
  }

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const activeUsers30Mins1 = await Users.find({ lastActive: { $gte: thirtyMinutesAgo }, role: { $ne: 'admin' } })
    .select('name email username lastActive');
  const activeUsers30Mins2 = await DailyUsers.find({ createdAt: { $gte: thirtyMinutesAgo }, user: null })
  const activeUsers30Mins = [...activeUsers30Mins1, ...activeUsers30Mins2];
  res.json({ activeUsers, activeUsers30Mins });
};

module.exports = onlineUsers;

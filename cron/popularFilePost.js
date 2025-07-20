const Posts = require('../models/Posts');
const Files = require('../models/Files');
const PageViews = require('../models/PageViews');
const cron = require('node-cron');

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const formattedYesterday = yesterday.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
});

cron.schedule('2 0 * * *', async () => {
    console.log('[CRON] Creating popular file post...');

    const now = new Date();
    const startOfYesterday = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 1,
        0, 0, 0, 0
    ));

    const endOfYesterday = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 1,
        23, 59, 59, 999
    ));

    try {
        const formattedYesterday = new Date(now.setDate(now.getDate() - 1)).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone: 'Asia/Kolkata'
        });

        const deleted = await Posts.deleteOne({
    createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
    author: '685680c4709e2711271639d1',
    text: { $regex: /^Here's the most viewed memory of yesterday!/ }
});
        console.log('[CRON] Deleted yesterday\'s post:', deleted);

        const topFile = await PageViews.aggregate([
            {
                $match: {
                    date: formattedYesterday,
                    route: { $regex: /^\/memories\/file\// }
                }
            },
            {
                $group: {
                    _id: '$route',
                    total: { $sum: '$visits' }
                }
            },
            { $sort: { total: -1 } },
            { $limit: 1 }
        ]);

        if (!topFile.length) {
            console.log('[CRON] No file views found for yesterday.');
            return;
        }

        const fileId = topFile[0]._id.replace('/memories/file/', '');
        if (!fileId.match(/^[0-9a-fA-F]{24}$/)) {
            console.warn('[CRON] Invalid file ID extracted:', fileId);
            return;
        }

        const file = await Files.findById(fileId).select("url");
        if (!file) {
            console.warn('[CRON] File not found for ID:', fileId);
            return;
        }

        const newPost = new Posts({
            text: `Here's the most viewed memory of yesterday! <a href='${topFile[0]._id}'>Click here</a> to view in full screen.`,
            media: {
                url: file.url,
                type: 'image'
            },
            author: '685680c4709e2711271639d1'
        });

        await newPost.save();
        console.log('[CRON] New popular file post created with ID:', newPost._id);

    } catch (error) {
        console.error('[CRON] ❌ Error creating new post:', error);
    }
}, {
    timezone: "Asia/Kolkata"
});
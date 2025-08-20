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

        const topFileRoute = topFile[0]._id;
        const newFileId = topFileRoute.replace('/memories/file/', '');

        if (!newFileId.match(/^[0-9a-fA-F]{24}$/)) {
            console.warn('[CRON] Invalid file ID extracted:', newFileId);
            return;
        }

        const yesterdaysPost = await Posts.findOne({
            createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
            author: '6899e28c181c7329d31384bc',
            text: { $regex: "Here's the most viewed memory of yesterday" }
        });

        if (yesterdaysPost) {
            if (yesterdaysPost.text.includes(newFileId)) {
                console.log('[CRON] Yesterday\'s popular post is already for the correct file. No action needed.');
                return;
            }
        }

        const file = await Files.findById(newFileId).select("url");
        if (!file) {
            console.warn('[CRON] File not found for ID:', newFileId);
            return;
        }

        const postContent = {
            text: `<p>Here's the most popular memory! <a href='${topFileRoute}'>Click here</a> to view in full screen.</p>`,
            media: {
                url: file.url,
                type: 'image'
            },
            author: '6899e28c181c7329d31384bc',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const updatedOrCreatedPost = await Posts.findOneAndUpdate(
            {
                createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
                author: '6899e28c181c7329d31384bc',
                text: { $regex: "Here's the most popular memory" }
            },
            { $set: postContent },
            { new: true, upsert: true }
        );
        console.log('[CRON] New popular file post created with ID:', updatedOrCreatedPost._id);

    } catch (error) {
        console.error('[CRON] ❌ Error creating new post:', error);
    }
}, {
    timezone: "Asia/Kolkata"
});
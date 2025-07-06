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

async function getTopFile() {
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
    if (topFile.length) {
        var file = await Files.findOne({ _id: topFile[0]._id.replace('/memories/file/', '') }).select("url")
        return { file, _id: topFile[0]._id }
    }
    return null
}

cron.schedule('2 0 * * *', async () => {
    try {
        var data = await getTopFile()
        if (data) {
            var newPost = new Posts({
                text: `Here's the most viewed memory of yesterday! <a href='${data._id}'>Click here</a> to view in full screen.`,
                media: {
                    url: data.file.url,
                    type: 'image'
                },
                author: '685680c4709e2711271639d1'
            })
            await newPost.save()
        }
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
        await Posts.deleteOne({
            createdAt: { $gte: startOfYesterday, $lte: endOfYesterday }
        });
    } catch (error) {
        console.error('[CRON] Error creating new post:', error);
    }
}, {
    timezone: "Asia/Kolkata"
});

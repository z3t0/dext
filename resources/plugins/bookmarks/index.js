require('string_score');
const browserBookmarks = require('browser-bookmarks');

/**
 * Converts the bookmark object to Dext item
 *
 * @param {Object} item - The bookmark object
 * @return {Object} - The Dext bookmark object
 */
const mapDextItem = item => ({
  title: item.title,
  subtitle: `(${item.folder || 'misc'}) - ${item.url}`,
  arg: item.url,
  icon: {
    path: item.favicon,
  },
});

module.exports = {
  action: 'openurl',
  query: (query, options = { size: 20 }) => new Promise(resolve => {
    const { size } = options;
    browserBookmarks.getChrome().then(bookmarks => {
      // resolve and exist if there's no bookmarks
      if (!bookmarks.length) {
        resolve({ items: [] });
        return;
      }

      // map to Dext items and apply scores
      const items = bookmarks.map((bookmark) => {
        const dextItem = mapDextItem(bookmark);
        const score = dextItem.title.score(query);
        return Object.assign({}, dextItem, {
          score,
        });
      });

      // filter out items with 0 score, and sort by score DESC
      const sortedItems = items
        .filter(i => i.score > 0)
        .sort((a, b) => {
          const scoreA = a.title.score(query);
          const scoreB = b.title.score(query);
          if (scoreA === scoreB) {
            return 0;
          } else if (scoreA < scoreB) {
            return 1;
          }
          return -1;
        })
        .slice(0, size);
      resolve({ items: sortedItems });
    });
  }),
};

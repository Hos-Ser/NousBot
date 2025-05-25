// Helper function to generate summary
function generateSummary(records) {
  let summary = "🎰 *Your Gacha Summary*\n\n";
  let totalPulls = 0;
  let fiveStars = 0;
  let fourStars = 0;

  for (const [banner, data] of Object.entries(records)) {
    if (!data || !data.list) continue;

    const pulls = data.list.length;
    totalPulls += pulls;

    const bannerName = getBannerName(banner);
    summary += `*${bannerName}*: ${pulls} pulls\n`;

    // Count rarities
    for (const item of data.list) {
      if (item.rarity === 5) fiveStars++;
      if (item.rarity === 4) fourStars++;
    }
  }

  summary += `\n🌟 *5-stars*: ${fiveStars}\n`;
  summary += `✨ *4-stars*: ${fourStars}\n`;
  summary += `🔢 *Total pulls*: ${totalPulls}`;

  return summary;
}

module.exports = generateSummary;

function generateSummary(records) {
  let summary = "🎰 *Your Gacha Summary*\n\n";
  let totalPulls = 0;
  const rarityCounts = { 3: 0, 4: 0, 5: 0 }; // qualityLevel -> count
  const bannerStats = {}; // Track stats per banner type

  // Process all banners
  Object.values(records).forEach((bannerData) => {
    if (!bannerData?.data?.length) return;

    const bannerType = bannerData.data[0]?.cardPoolType || "Unknown";
    bannerStats[bannerType] = bannerStats[bannerType] || {
      pulls: 0,
      lastPull: null,
      rarityCounts: { 3: 0, 4: 0, 5: 0 },
    };

    bannerData.data.forEach((item) => {
      totalPulls++;
      const rarity = item.qualityLevel;

      // Update global counts
      rarityCounts[rarity] = (rarityCounts[rarity] || 0) + 1;

      // Update banner-specific counts
      bannerStats[bannerType].pulls++;
      bannerStats[bannerType].rarityCounts[rarity] =
        (bannerStats[bannerType].rarityCounts[rarity] || 0) + 1;
      bannerStats[bannerType].lastPull = item.time;
    });
  });

  // Add banner-specific summaries
  Object.entries(bannerStats).forEach(([bannerType, stats]) => {
    summary += `*${bannerType}*\n`;
    summary += `Pulls: ${stats.pulls} | `;
    summary += `3★: ${stats.rarityCounts[3]} | `;
    summary += `4★: ${stats.rarityCounts[4]} | `;
    summary += `5★: ${stats.rarityCounts[5]}\n`;
    summary += `Last pull: ${stats.lastPull}\n\n`;
  });

  // Add global summary
  summary += `*Global Stats*\n`;
  summary += `Total pulls: ${totalPulls}\n`;
  summary += `3★ items: ${rarityCounts[3]} (${Math.round(
    (rarityCounts[3] / totalPulls) * 100
  )}%)\n`;
  summary += `4★ items: ${rarityCounts[4]} (${Math.round(
    (rarityCounts[4] / totalPulls) * 100
  )}%)\n`;
  summary += `5★ items: ${rarityCounts[5]} (${Math.round(
    (rarityCounts[5] / totalPulls) * 100
  )}%)\n`;

  // Calculate and add pity counters
  const lastFiveStar = findLastPullByRarity(records, 5);
  if (lastFiveStar) {
    const pityCounter = calculatePitySinceLast(records, lastFiveStar.time);
    summary += `\nCurrent pity since last 5★: ${pityCounter} pulls\n`;
    summary += `Last 5★: ${lastFiveStar.name} on ${lastFiveStar.time}\n`;
  }

  return summary;
}

// Helper function to find the last pull of specific rarity
function findLastPullByRarity(records, rarity) {
  let lastItem = null;
  Object.values(records).forEach((bannerData) => {
    if (!bannerData?.data?.length) return;

    bannerData.data.forEach((item) => {
      if (item.qualityLevel === rarity) {
        if (!lastItem || new Date(item.time) > new Date(lastItem.time)) {
          lastItem = item;
        }
      }
    });
  });
  return lastItem;
}

// Helper function to calculate pulls since last 5★
function calculatePitySinceLast(records, lastFiveStarTime) {
  let pityCounter = 0;
  const cutoffDate = new Date(lastFiveStarTime);

  Object.values(records).forEach((bannerData) => {
    if (!bannerData?.data?.length) return;

    bannerData.data.forEach((item) => {
      if (new Date(item.time) > cutoffDate) {
        pityCounter++;
      }
    });
  });

  return pityCounter;
}

module.exports = generateSummary;

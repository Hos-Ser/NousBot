function generateSummary(records) {
  let summary = "🎰 Gacha Summary\n\n";
  let totalPulls = 0;
  const rarityCounts = { 3: 0, 4: 0, 5: 0 };
  const bannerStats = {};

  // Process all pools
  Object.entries(records).forEach(([poolKey, poolData]) => {
    if (!poolData || poolData.length === 0) return;

    const poolName = poolData[0]?.cardPoolType || poolKey;
    bannerStats[poolName] = {
      pulls: poolData.length,
      lastPull: poolData[0]?.time,
      rarities: { 3: 0, 4: 0, 5: 0 },
    };

    poolData.forEach((item) => {
      totalPulls++;
      const rarity = item.qualityLevel;
      rarityCounts[rarity]++;
      bannerStats[poolName].rarities[rarity]++;
    });
  });

  // Add banner details
  Object.entries(bannerStats).forEach(([name, stats]) => {
    summary += `▸ ${name}\n`;
    summary += `  Pulls: ${stats.pulls} | `;
    summary += `3★: ${stats.rarities[3]} | `;
    summary += `4★: ${stats.rarities[4]} | `;
    summary += `5★: ${stats.rarities[5]}\n`;
    summary += `  Last: ${stats.lastPull}\n\n`;
  });

  // Add global stats
  summary += `🌟 Global Stats\n`;
  summary += `Total Pulls: ${totalPulls}\n`;
  summary += `3★ Rate: ${((rarityCounts[3] / totalPulls) * 100).toFixed(1)}%\n`;
  summary += `4★ Rate: ${((rarityCounts[4] / totalPulls) * 100).toFixed(1)}%\n`;
  summary += `5★ Rate: ${((rarityCounts[5] / totalPulls) * 100).toFixed(1)}%\n`;

  // Calculate pity
  const lastFiveStar = findLastRarityPull(records, 5);
  if (lastFiveStar) {
    summary += `\nLast 5★: ${lastFiveStar.name} (${lastFiveStar.time})\n`;
    summary += `Pity Since: ${calculatePity(records, lastFiveStar.time)} pulls`;
  }

  return summary;
}

// Helper functions
function findLastRarityPull(records, rarity) {
  let lastItem = null;
  Object.values(records)
    .flat()
    .forEach((item) => {
      if (item.qualityLevel === rarity) {
        if (!lastItem || new Date(item.time) > new Date(lastItem.time)) {
          lastItem = item;
        }
      }
    });
  return lastItem;
}

function calculatePity(records, lastTime) {
  return Object.values(records)
    .flat()
    .filter((item) => new Date(item.time) > new Date(lastTime)).length;
}

function generateSummary(records) {
  let summary = "✨ *Wuthering Waves Gacha Summary* ✨\n\n";

  // Process each banner
  Object.entries(records).forEach(([bannerKey, pulls]) => {
    if (!pulls || pulls.length === 0) return;

    const bannerName =
      pulls[0]?.cardPoolType || `Banner ${bannerKey.split("_")[1]}`;
    const fiveStarPulls = [];
    const fourStarPulls = [];
    let currentPity5 = 0;
    let currentPity4 = 0;
    let totalPulls = 0;

    // Calculate metrics
    pulls.forEach((pull, index) => {
      totalPulls++;
      currentPity5++;
      currentPity4++;

      if (pull.qualityLevel === 5) {
        fiveStarPulls.push({
          pullNumber: index + 1,
          pity: currentPity5,
          item: pull.name,
        });
        currentPity5 = 0;
      }

      if (pull.qualityLevel === 4) {
        fourStarPulls.push(currentPity4);
        currentPity4 = 0;
      }
    });

    // Calculate averages
    const avgPity5 =
      fiveStarPulls.length > 0
        ? (
            fiveStarPulls.reduce((sum, item) => sum + item.pity, 0) /
            fiveStarPulls.length
          ).toFixed(1)
        : "N/A";

    const avgPity4 =
      fourStarPulls.length > 0
        ? (
            fourStarPulls.reduce((sum, pity) => sum + pity, 0) /
            fourStarPulls.length
          ).toFixed(1)
        : "N/A";

    // Format banner section
    summary += `🎪 *${bannerName}*\n`;
    summary += `▸ Total Pulls: ${totalPulls}\n`;
    summary += `▸ 5★ Pity: ${currentPity5} (since last)\n`;
    summary += `▸ 4★ Pity: ${currentPity4} (since last)\n`;
    summary += `▸ Avg 5★ Pity: ${avgPity5}\n`;
    summary += `▸ Avg 4★ Pity: ${avgPity4}\n`;

    // Add 5★ pull history if available
    if (fiveStarPulls.length > 0) {
      summary += `\n⭐ *5★ Pull History*\n`;
      fiveStarPulls.forEach((star, i) => {
        const sinceLast =
          i === 0
            ? star.pullNumber
            : star.pullNumber - fiveStarPulls[i - 1].pullNumber;
        summary += `  • ${star.item} (Pity: ${star.pity}, After: ${sinceLast} pulls)\n`;
      });
    }

    summary += "\n";
  });

  return summary;
}

module.exports = generateSummary;

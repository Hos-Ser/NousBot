function generateSummary(records) {
  let summary = "✨ *Wuthering Waves Gacha Summary* ✨\n\n";

  Object.entries(records).forEach(([bannerKey, pulls]) => {
    if (!pulls || pulls.length === 0) return;

    const bannerName =
      pulls[0]?.cardPoolType || `Banner ${bannerKey.split("_")[1]}`;
    const fiveStarHistory = [];
    const fourStarHistory = [];
    let currentPity5 = 0;
    let currentPity4 = 0;
    let totalPulls = pulls.length;

    // Reverse chronological order (newest first)
    const reversedPulls = [...pulls].reverse();

    // Calculate current pity (counting forward from now)
    for (const pull of reversedPulls) {
      currentPity5++;
      currentPity4++;

      if (pull.qualityLevel === 5) {
        fiveStarHistory.push({
          name: pull.name,
          time: pull.time,
          pity: currentPity5,
        });
        currentPity5 = 0;
      }

      if (pull.qualityLevel === 4) {
        fourStarHistory.push(currentPity4);
        currentPity4 = 0;
      }

      // Stop counting when we hit both rarities
      if (currentPity5 === 0 && currentPity4 === 0) break;
    }

    // Calculate averages (using original chronological order)
    const allFiveStars = pulls.filter((p) => p.qualityLevel === 5);
    const allFourStars = pulls.filter((p) => p.qualityLevel === 4);

    const avgPity5 =
      allFiveStars.length > 0
        ? (pulls.length / allFiveStars.length).toFixed(1)
        : "N/A";

    const avgPity4 =
      allFourStars.length > 0
        ? (pulls.length / allFourStars.length).toFixed(1)
        : "N/A";

    // Format output
    summary += `🎪 *${bannerName}*\n`;
    summary += `▸ Total Pulls: ${totalPulls}\n`;
    summary += `▸ Current 5★ Pity: ${currentPity5}\n`;
    summary += `▸ Current 4★ Pity: ${currentPity4}\n`;
    summary += `▸ Avg 5★ Every: ${avgPity5} pulls\n`;
    summary += `▸ Avg 4★ Every: ${avgPity4} pulls\n`;

    if (fiveStarHistory.length > 0) {
      summary += `\n⭐ *Last 5★*\n`;
      const last5Star = fiveStarHistory[0];
      summary += `  • ${last5Star.name} (${last5Star.time})\n`;
      summary += `    → Pity: ${last5Star.pity} (${
        totalPulls - last5Star.pity + 1
      }-${totalPulls})\n`;
    }

    if (allFiveStars.length > 1) {
      summary += `\n📊 *5★ Pull Intervals*\n`;
      for (let i = 1; i < allFiveStars.length; i++) {
        const prev = allFiveStars[i - 1];
        const curr = allFiveStars[i];
        const interval = curr.pullNumber - prev.pullNumber;
        summary += `  • ${interval} pulls between ${prev.name} → ${curr.name}\n`;
      }
    }

    summary += "\n";
  });

  return summary;
}

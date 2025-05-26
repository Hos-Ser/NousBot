function generateSummary(records) {
  let summary = "✨ *Wuthering Waves Gacha Summary* ✨\n\n";

  Object.entries(records).forEach(([bannerKey, pulls]) => {
    if (!pulls || pulls.length === 0) return;

    const bannerType = bannerKey.split("_")[1];
    let bannerName;
    switch (bannerType) {
      case "1":
        bannerName = "بنر کرکتر ایونت";
        break;
      case "2":
        bannerName = "بنر اسلحه ایونت";
        break;
      case "3":
        bannerName = "بنر کرکتر استاندارد";
        break;
      case "4":
        bannerName = "بنر اسلحه استاندارد";
        break;
      case "5":
        bannerName = "بنر مبتدی";
        break;
      case "6":
        bannerName = "بنر انتخابی";
        break;
      case "7":
        bannerName = "بنر هدیه بازگشت";
        break;
      default:
        bannerName = "Unknown";
        break;
    }
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
    summary += `🎲 *${bannerName}*\n`;
    summary += `▸ مجموع کانوین ها: ${totalPulls}\n`;
    summary += `▸ پیتی 5★ : ${currentPity5}\n`;
    summary += `▸ پیتی 4★ : ${currentPity4}\n`;
    summary += `▸ میانگین 5★ : ${avgPity5} pulls\n`;
    summary += `▸ میانگین 4★ : ${avgPity4} pulls\n`;

    if (allFiveStars.length > 0) {
      summary += `\n📊 *پیتی ها 5★*\n`;

      const pullsWithPosition = pulls.map((pull, index) => ({
        ...pull,
        position: index + 1,
      }));

      const fiveStarsWithPositions = pullsWithPosition.filter(
        (p) => p.qualityLevel === 5
      );

      for (let i = 1; i < fiveStarsWithPositions.length; i++) {
        const prev = fiveStarsWithPositions[i - 1];
        const curr = fiveStarsWithPositions[i];
        const interval = curr.position - prev.position;
        summary += `  • ${prev.name} → ${interval}\n`;
      }
      summary += `  • ${
        fiveStarsWithPositions[fiveStarsWithPositions.length - 1].name
      } → ${
        totalPulls -
        fiveStarsWithPositions[fiveStarsWithPositions.length - 1].position +
        1
      }\n`;
    }

    summary += "\n";
  });

  return summary;
}

module.exports = generateSummary;

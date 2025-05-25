function getBannerName(bannerKey) {
  const [type, id] = bannerKey.split("_").map(Number);
  switch (type) {
    case 1:
      return `Character Banner ${id}`;
    case 2:
      return "Weapon Banner";
    case 3:
      return "Standard Banner";
    case 4:
      return "Beginner Banner";
    default:
      return `Unknown Banner (${type})`;
  }
}

module.exports = getBannerName;

function getDaysForRange(range) {
    if (range === "last-night") return 1;
    if (range === "last-week") return 7;
    if (range === "last-month") return 30;
    return 7;
  }
  
  function getStartDateForRange(range) {
    const days = getDaysForRange(range);
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }
  
  function getIsoStartForRange(range) {
    return getStartDateForRange(range).toISOString();
  }
  
  module.exports = {
    getDaysForRange,
    getStartDateForRange,
    getIsoStartForRange,
  };
  
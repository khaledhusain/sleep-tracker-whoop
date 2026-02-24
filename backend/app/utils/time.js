function getDaysForRange(range) {
    if (range === "last-night") return 1;
    if (range === "last-week") return 7;
    if (range === "last-month") return 30;
}

module.exports = {
    getDaysForRange
};
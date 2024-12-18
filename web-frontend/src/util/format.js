export const formatDecimal = (decimal, numDecimalPlaces = 2) => {
    return decimal.toLocaleString("en-US", {
        minimumFractionDigits: numDecimalPlaces,
        maximumFractionDigits: numDecimalPlaces,
    });
};

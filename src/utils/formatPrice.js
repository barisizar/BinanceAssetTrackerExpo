export const formatPriceInINR = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
};

export const removeDecimal = (number) => {
    if (typeof number !== 'number' || isNaN(number)) {
        return 'N/A';
    }

    const numberStr = number.toString().replace('.', '');
    return parseInt(numberStr, 10);
};

export const formatNumberWithUnits = (number) => {
    if (typeof number !== 'number' || isNaN(number)) {
        return 'N/A';
    }

    number = removeDecimal(number);

    const units = ['', 'K', 'million', 'billion', 'trillion', 'quadrillion'];
    let unitIndex = 0;
    let formattedNumber = Math.abs(number);

    while (formattedNumber >= 1000 && unitIndex < units.length - 1) {
        formattedNumber /= 1000;
        unitIndex++;
    }

    return `${formattedNumber.toFixed(1)} ${units[unitIndex]}`;
};
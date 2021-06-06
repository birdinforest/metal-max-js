/**
 * Convert date object to ISO String / mySQL date (UTC)
 * @param {Date} date a Date object (optional, default is NOW)
 */
export const dateTime = (date: Date): string => {
    let realDate = date;

    if(!date) {
        // now
        realDate = new Date();
    }

    return realDate.toISOString().slice(0, 19).replace('T', ' ');
};
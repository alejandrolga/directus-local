export default class DateFormatter {
    static formatDate(milliseconds) {
        if (milliseconds == null || isNaN(milliseconds)) return null;
        const date = new Date(milliseconds);
        return date.toISOString();
    }
}

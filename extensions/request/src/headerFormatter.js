export default class HeaderFormatter {
    static formatHeader(header) {
        if (header === 'sku' || header === 'id') {
            return header.toUpperCase();
        }
        return header.split('_').map((word, index) => {
            if (index === 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    }

    static formatHeaders(headers) {
        return headers.map(header => ({
            text: this.formatHeader(header),
            value: header,
            sortable: true,
            resizable: true,
            width: "250",
        }));
    }
}

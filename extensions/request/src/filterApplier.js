export default class FilterApplier {
    static applyFilter(item, filter) {
        if (filter._and) {
            return filter._and.every(subFilter => this.applyFilter(item, subFilter));
        }
        if (filter._or) {
            return filter._or.some(subFilter => this.applyFilter(item, subFilter));
        }
        for (const key in filter) {
            const value = filter[key];
            if (value._eq !== undefined) {
                if (value._eq === null) continue;
                if (String(item[key]) !== String(value._eq)) return false;
            }
            if (value._neq !== undefined) {
                if (String(item[key]) === String(value._neq)) return false;
            }
            if (value._lt !== undefined) {
                if (item[key] >= value._lt) return false;
            }
            if (value._lte !== undefined) {
                if (item[key] > value._lte) return false;
            }
            if (value._gt !== undefined) {
                if (item[key] <= value._gt) return false;
            }
            if (value._gte !== undefined) {
                if (item[key] < value._gte) return false;
            }
            if (value._in !== undefined) {
                if (!value._in.includes(item[key])) return false;
            }
            if (value._nin !== undefined) {
                if (value._nin.includes(item[key])) return false;
            }
            if (value._null !== undefined) {
                if (value._null && item[key] !== null) return false;
                if (!value._null && item[key] === null) return false;
            }
            if (value._nnull !== undefined) {
                if (value._nnull && item[key] === null) return false;
                if (!value._nnull && item[key] !== null) return false;
            }
            if (value._contains !== undefined && value._contains != null) {
                if (!String(item[key]).includes(value._contains)) return false;
            }
            if (value._icontains !== undefined && value._icontains != null) {
                if (!String(item[key]).toLowerCase().includes(value._icontains.toLowerCase())) return false;
            }
            if (value._ncontains !== undefined && value._ncontains != null) {
                if (String(item[key]).includes(value._ncontains)) return false;
            }
            if (value._starts_with !== undefined && value._starts_with != null) {
                if (!String(item[key]).startsWith(value._starts_with)) return false;
            }
            if (value._istarts_with !== undefined && value._istarts_with != null) {
                if (!String(item[key]).toLowerCase().startsWith(value._istarts_with.toLowerCase())) return false;
            }
            if (value._nstarts_with !== undefined && value._nstarts_with != null) {
                if (String(item[key]).startsWith(value._nstarts_with)) return false;
            }
            if (value._ends_with !== undefined && value._ends_with != null) {
                if (!String(item[key]).endsWith(value._ends_with)) return false;
            }
            if (value._iends_with !== undefined && value._iends_with != null) {
                if (!String(item[key]).toLowerCase().endsWith(value._iends_with.toLowerCase())) return false;
            }
            if (value._nends_with !== undefined && value._nends_with != null) {
                if (String(item[key]).endsWith(value._nends_with)) return false;
            }
            if (value._between !== undefined) {
                if (item[key] < value._between[0] || item[key] > value._between[1]) return false;
            }
            if (value._nbetween !== undefined) {
                if (item[key] >= value._nbetween[0] && item[key] <= value._nbetween[1]) return false;
            }
            if (value._empty !== undefined) {
                if (value._empty && item[key]) return false;
                if (!value._empty && !item[key]) return false;
            }
            if (value._nempty !== undefined) {
                if (value._nempty && !item[key]) return false;
                if (!value._nempty && item[key]) return false;
            }
        }
        return true;
    }
}

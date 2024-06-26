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
  
        if (typeof value === 'object' && value !== null) {
          const nestedItem = item[key];
  
          // If the nestedItem is an object, apply the nested filter
          if (typeof nestedItem === 'object' && nestedItem !== null) {
            if (!this.applyFilter(nestedItem, value)) {
              return false;
            }
            continue;
          }
        }
  
        const itemValue = item[key];
  
        if (value._eq !== undefined) {
          if (value._eq === null) continue;
          if (String(itemValue) !== String(value._eq)) return false;
        }
        if (value._neq !== undefined) {
          if (String(itemValue) === String(value._neq)) return false;
        }
        if (value._lt !== undefined) {
          if (new Date(itemValue) >= new Date(value._lt)) return false;
        }
        if (value._lte !== undefined) {
          if (new Date(itemValue) > new Date(value._lte)) return false;
        }
        if (value._gt !== undefined) {
          if (new Date(itemValue) <= new Date(value._gt)) return false;
        }
        if (value._gte !== undefined) {
          if (new Date(itemValue) < new Date(value._gte)) return false;
        }
        if (value._in !== undefined && value._in.length > 0) {
          if (!value._in.map(String).includes(String(itemValue))) return false;
        }
        if (value._nin !== undefined && value._nin.length > 0) {
          if (value._nin.map(String).includes(String(itemValue))) return false;
        }
        if (value._null !== undefined) {
          if (value._null && itemValue !== null) return false;
          if (!value._null && itemValue === null) return false;
        }
        if (value._nnull !== undefined) {
          if (value._nnull && itemValue === null) return false;
          if (!value._nnull && itemValue !== null) return false;
        }
        if (value._contains !== undefined && value._contains != null) {
          if (!String(itemValue).includes(value._contains)) return false;
        }
        if (value._icontains !== undefined && value._icontains != null) {
          if (!String(itemValue).toLowerCase().includes(value._icontains.toLowerCase())) return false;
        }
        if (value._ncontains !== undefined && value._ncontains != null) {
          if (String(itemValue).includes(value._ncontains)) return false;
        }
        if (value._starts_with !== undefined && value._starts_with != null) {
          if (!String(itemValue).startsWith(value._starts_with)) return false;
        }
        if (value._istarts_with !== undefined && value._istarts_with != null) {
          if (!String(itemValue).toLowerCase().startsWith(value._istarts_with.toLowerCase())) return false;
        }
        if (value._nstarts_with !== undefined && value._nstarts_with != null) {
          if (String(itemValue).startsWith(value._nstarts_with)) return false;
        }
        if (value._ends_with !== undefined && value._ends_with != null) {
          if (!String(itemValue).endsWith(value._ends_with)) return false;
        }
        if (value._iends_with !== undefined && value._iends_with != null) {
          if (!String(itemValue).toLowerCase().endsWith(value._iends_with.toLowerCase())) return false;
        }
        if (value._nends_with !== undefined && value._nends_with != null) {
          if (String(itemValue).endsWith(value._nends_with)) return false;
        }
        if (value._between !== undefined) {
          if (new Date(itemValue) < new Date(value._between[0]) || new Date(itemValue) > new Date(value._between[1])) return false;
        }
        if (value._nbetween !== undefined) {
          if (new Date(itemValue) >= new Date(value._nbetween[0]) && new Date(itemValue) <= new Date(value._nbetween[1])) return false;
        }
        if (value._empty !== undefined) {
          if (value._empty && itemValue) return false;
          if (!value._empty && !itemValue) return false;
        }
        if (value._nempty !== undefined) {
          if (value._nempty && !itemValue) return false;
          if (!value._nempty && itemValue) return false;
        }
      }
      return true;
    }
  }
  
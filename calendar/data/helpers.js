var exports = module.exports = {};

// Removes all fields in the given object that are not given in the filterFields array and ensures that 'required' fields are present and not empty
exports.filterObjectFields = function(obj, filterFields) {
    var filteredObj = {};

    for (let field in obj) {
        // Only include fields that are included in the filterFields object and have the same type specified
        var val = obj[field];
        var include = filterFields.hasOwnProperty(field) && typeof val === filterFields[field].type;

        // If the field is required, check that it is not 'empty'
        if (include && filterFields[field].required) {

            switch (filterFields[field].type) {
                case 'string':
                    include = val.trim().length;
                    val = val.trim();
                    break;
                case 'number':
                    include = !isNaN(val);
                    break;
                case 'object':
                    include = Object.keys(val).length;
            }
        }

        if (include) {
            filteredObj[field] = val;
        }
    }

    return filteredObj;
};
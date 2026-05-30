import { isEqual } from 'lodash';


export function compareData({ formData, editItem, fields }) {
    const normalizedByField = (value, fieldConfig) => {
        if (value === null || value === undefined) return '';

        const type = fieldConfig?.form?.type;
        switch (type) {
            case 'number': {
                let num = Number(value);
                return isNaN(num) ? '' : num;
            }
            case 'date':
                return value ? value.split('T')[0] : '';
            case 'array':
                return Array.isArray(value) ? [...value].sort() : [];
            default:
                return typeof value === 'string' ? value.trim() : value;
        }
    }
    const changedFields = [];

    const keys = fields?.length
        ? fields
            .filter(f => f.form?.compare !== false)
            .map(f => f.name)
        : Object.keys(formData);

    keys.forEach(key => {        
        const fieldMap = Object.fromEntries(fields.map(f => [f.name, f]));

        const fieldConfig = fieldMap[key]

        const formVal = normalizedByField(formData[key], fieldConfig);
        const originalVal = normalizedByField(editItem?.[key], fieldConfig);

        if (!isEqual(formVal, originalVal)) {
            changedFields.push({
                field: key,
                formValue: formVal,
                originalValue: originalVal
            });
        }
    });


    return {
        isChanged: changedFields.length > 0,
        changedFields
    }
}

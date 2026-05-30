import { useMemo } from "react";

export default function useLookupMaps(data, keyField = 'id', fieldName) {
    return useMemo(() => {
        return Object.fromEntries(
            data.map(item => [Number(item[keyField]), item[fieldName]])
        )
    }, [data, keyField, fieldName])
}
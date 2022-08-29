import { AromaDataType, AromaDataTypeFields } from './types';

/**
 * Get available data types from aroma records.
 *
 * @param records
 */
export function getAvailableDataTypes<T>(records: T[]): AromaDataType[] {
  return records
    .reduce((result: AromaDataType[], row) => {
      Object.keys(AromaDataTypeFields)
        .map((k) => AromaDataTypeFields[k as keyof typeof AromaDataTypeFields])
        .forEach((type) => {
          if (row[type as keyof typeof row] !== undefined && result.indexOf(type as AromaDataType) === -1) {
            result.push(type as AromaDataType);
          }
        });

      return result;
    }, [] as AromaDataType[])
    .filter((type) => type?.toLowerCase()?.indexOf('relative') === -1);
}

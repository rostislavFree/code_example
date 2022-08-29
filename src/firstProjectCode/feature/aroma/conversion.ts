import { scripts } from 'lab-dataviz';

import { AromaDataTypeFields, AromaRecord, ConvertedAroma, ConvertedIngredient, DATATYPE_MAP } from './types';

export const getIngredientColumns = (): string[] => [
  'ProductPreparationId',
  'Name',
  'Fd',
  'Type',
  'TypeIndex',
  'TypeId',
  'Descriptor',
  'DescriptorIndex',
  'DescriptorId',
];

export const toIngredient = (
  id: number | null,
  data: AromaRecord[],
  dataTypeField: AromaDataTypeFields.fd | AromaDataTypeFields.oav,
): ConvertedIngredient => {
  const sumAromaValues = getSumAromaValues(data, dataTypeField);

  return <ConvertedIngredient>{
    ingredient: { id },
    intensity: 1,
    totalPd: sumAromaValues,
    name: data[0].name || data[0].descriptor || 'unknown',
    aromas: data.map((x, index) => toAroma(x, sumAromaValues, index, DATATYPE_MAP[dataTypeField])),
  };
};

const toAroma = (
  data: AromaRecord,
  totalValue: number,
  index: number,
  dataTypeField: AromaDataTypeFields,
): ConvertedAroma => ({
  value: { rel: Number(data[dataTypeField]) || 0 },
  _links: {
    descriptor: {
      id: data.descriptorId,
      name: data.descriptor,
      description: '',
      _meta: { index: Number(data.descriptorIndex) },
      _links: {
        type: {
          id: data.typeId,
          name: data.type,
          description: '',
          _meta: { index: Number(data.typeIndex) },
        },
      },
    },
  },
  _meta: { index },
});

export const imPatchIngredientJSON = (data: ConvertedIngredient): ConvertedIngredient => {
  const copy = JSON.parse(JSON.stringify(data));
  return scripts.patchIngredientJSON(copy);
};

export function getSumAromaValues(aromaRows: AromaRecord[], field = AromaDataTypeFields.fd): number {
  return aromaRows.reduce(
    (previous: number, current) => previous + Number(current[field as keyof AromaRecord] ?? 0),
    0,
  );
}

export function calculateRelativeValue(
  currentValue: number,
  newValue: number,
  currentRelativeValue: number,
  initialSumAromaValues: number,
  field: string,
): number {
  if (field === AromaDataTypeFields.oav || field === AromaDataTypeFields.fd) {
    return (
      Number(newValue || '0.01') / (initialSumAromaValues - Number(currentValue || '0.01') + Number(newValue || '0.01'))
    );
  }

  return initialSumAromaValues * Number(newValue || '0.01');
}

export function findAromaRecordInArray(array: AromaRecord[], target: AromaRecord): AromaRecord {
  return array.filter((i) => i.typeId === target.typeId && i.descriptorId === target.descriptorId)[0] || {};
}

export function boostNotEmptyRows(array: AromaRecord[], field: AromaDataTypeFields): AromaRecord[] {
  return array.sort((a, b) => {
    if (a[field]) return -1;
    if (b[field]) return 1;
    return 0;
  });
}

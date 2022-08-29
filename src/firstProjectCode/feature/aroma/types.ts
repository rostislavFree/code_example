// keep the two structures here in sync
import { DotGraphRowData } from 'lab-dataviz';

export type AromaRecord = {
  productPreparationId: number;
  name?: string;
  fd: number;
  fdRelative: number;
  oav?: number;
  oavRelative?: number;
  type: string;
  typeIndex?: number;
  typeId: number;
  descriptor: string;
  descriptorIndex?: number;
  descriptorId: number;
  id: string | number;
  molecules: AromaMolecule[];
};

export type AromaMolecule = {
  name: string;
  moleculeId: number;
};

export type ConvertedAroma = {
  value: { rel: number };
  _links: {
    descriptor: {
      id: number;
      name: string;
      description: string;
      _meta: { index: number };
      _links: {
        type: {
          id: number;
          name: string;
          description: string;
          _meta: { index: number };
        };
      };
    };
  };
  _meta: { index: number };
};

export type AromaRow = [number, string, number, string, number, number, string, number, number];

export type ConvertedIngredient = {
  ingredient: { id: number };
  intensity: number;
  totalPd: number;
  name: string;
  aromas: ConvertedAroma[];
};

export type DotGraphFormRecord = DotGraphRowData & { rowPosition: number; aromaRecords?: AromaRecord[] };

export type IngredientProfileRecord = Omit<AromaRecord, 'productPreparationId' | 'name' | 'fd' | 'id'> & {
  fd: { original: number; override: number };
  oav?: { original: number; override: number };
};

export interface IngredientProfile {
  name: string;
  description: string;
  data?: { records?: IngredientProfileRecord[] };
}

export interface AromaWheelResponse {
  profile?: IngredientProfile;
}

export enum AromaDataTypeFields {
  oav = 'oav',
  oavRelative = 'oavRelative',
  fd = 'fd',
  fdRelative = 'fdRelative',
}

export const DATATYPE_MAP: { [absoluteField: string]: AromaDataTypeFields } = {
  [AromaDataTypeFields.fdRelative]: AromaDataTypeFields.fd,
  [AromaDataTypeFields.oavRelative]: AromaDataTypeFields.oav,
  [AromaDataTypeFields.fd]: AromaDataTypeFields.fdRelative,
  [AromaDataTypeFields.oav]: AromaDataTypeFields.oavRelative,
};

export type AromaDataType = AromaDataTypeFields.oav | AromaDataTypeFields.fd;

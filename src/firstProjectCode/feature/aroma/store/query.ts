import { AromaType } from 'lab-dataviz';
import { FetchData } from 'use-http/dist/cjs/types';

import {
  buildActionUrl,
  TYPE_ADD_NEW_AROMA_PROFILE_VARIANT,
  TYPE_AROMA_DATA_BY_PRODUCT_PREP_ID,
  TYPE_LIST_AROMA_PROFILES,
  TYPE_UPDATE_AROMA_PROFILE_VARIANT,
} from '../../../shared/url';
import { FetchGet } from '../../../types';
import { boostNotEmptyRows } from '../conversion';
import {
  AromaDataType,
  AromaDataTypeFields,
  AromaRecord,
  AromaWheelResponse,
  DotGraphFormRecord,
  IngredientProfileRecord,
} from '../types';
import { getAvailableDataTypes } from '../utils';
import { AromaTableProfile, AromaVariantsResponse, SetDotGraphRows, SetIngredientAromaVizRows } from './types';

export type IngredientWithAromaTypes = Omit<DotGraphFormRecord, 'aromaRecords'> & {
  aromaRecords: (Omit<AromaRecord, 'type'> & { type: AromaType })[];
};

export async function fetchIngredientAromaVizRows(
  get: FetchGet<AromaWheelResponse>,
  version: string,
  productPreparationId: number,
  dataType?: AromaDataTypeFields,
  profileName?: string,
): Promise<SetIngredientAromaVizRows> {
  const { profile: { data } = {} } = await get(
    buildActionUrl({ version, productPreparationId, profileName }, TYPE_AROMA_DATA_BY_PRODUCT_PREP_ID),
  );

  const dataTypes = dataType
    ? [dataType as AromaDataType]
    : getAvailableDataTypes<IngredientProfileRecord>(data?.records || []);

  return {
    aromaVizRows: convertAromaRecordsToTableRows(productPreparationId, data?.records || [], dataTypes[0]),
    type: dataTypes[0],
  };
}

export function convertAromaRecordsToTableRows(
  productPreparationId: number,
  records: IngredientProfileRecord[],
  dataType: AromaDataTypeFields,
): AromaRecord[] {
  return boostNotEmptyRows(
    records.map((row, id) => ({
      ...row,
      fd: typeof row?.fd?.override === undefined ? row?.fd?.original : row?.fd?.override,
      oav: typeof row?.oav?.override === undefined ? row?.oav?.original : row?.oav?.override,
      productPreparationId,
      id,
    })),
    dataType,
  );
}

export async function fetchIngredientDotGraphRows(
  get: FetchGet<AromaWheelResponse>,
  version: string,
  ingredient: DotGraphFormRecord,
): Promise<SetDotGraphRows> {
  const iRow = { ...ingredient, aromaTypes: [], aromaTypeToMolecules: {} } as IngredientWithAromaTypes;

  if (!iRow.aromaRecords && iRow.id) {
    const { aromaVizRows } = await fetchIngredientAromaVizRows(get, version, iRow.id);
    iRow.aromaRecords = (aromaVizRows || []) as (Omit<AromaRecord, 'type'> & { type: AromaType })[];
  }

  iRow.aromaRecords?.forEach(({ type, molecules: mols = [] }) => {
    if (!iRow.aromaTypes.includes(type)) {
      iRow.aromaTypes.push(type);
    }

    iRow.aromaTypeToMolecules[type] = [...(iRow.aromaTypeToMolecules[type] || []), ...mols.map((m) => m.moleculeId)];
  });

  return {
    dotGraphMainIngredient: iRow?.rowPosition === -1 ? iRow : null,
    addDotGraphOtherIngredient: iRow?.rowPosition > -1 ? iRow : undefined,
  };
}

export async function postAromaVariant(
  fetch: FetchData<AromaTableProfile>,
  version: string,
  productPreparationId: number,
  profile: AromaTableProfile,
  update = false,
): Promise<AromaTableProfile> {
  const type = update ? TYPE_UPDATE_AROMA_PROFILE_VARIANT : TYPE_ADD_NEW_AROMA_PROFILE_VARIANT;
  const records = (profile?.data?.records || []).map(({ typeId, descriptorId, fd, oav }) => ({
    typeId,
    descriptorId,
    fd: fd ? { override: Number(fd) } : undefined,
    oav: oav ? { override: Number(oav) } : undefined,
  }));

  return fetch(buildActionUrl({ version, productPreparationId, profileName: profile?.name }, type), {
    coreVersion: version,
    productPreparationId,
    variantName: update ? profile?.name : undefined,
    overrides: update ? records : undefined,
    profile: update ? undefined : { ...profile, data: { ...(profile.data || {}), records } },
  });
}

export async function getAromaVariants(
  fetch: FetchGet<AromaVariantsResponse>,
  version: string,
  productPreparationId: number,
): Promise<AromaVariantsResponse> {
  return fetch(buildActionUrl({ version, productPreparationId }, TYPE_LIST_AROMA_PROFILES));
}

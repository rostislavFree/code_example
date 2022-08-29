import { FetchData } from 'use-http/dist/cjs/types';

import { ErrorState, LoadingState } from '../../../store/types';
import { FetchGet, IngredientDBIngredientType } from '../../../types';
import { AromaDataType, AromaRecord, DotGraphFormRecord, IngredientProfile } from '../types';

export interface AromaStateType extends ErrorState, LoadingState {
  aromaVizRows: AromaRecord[];
  dotGraphMainIngredient: DotGraphFormRecord | null;
  dotGraphOtherIngredients: DotGraphFormRecord[];
  mainIngredient: IngredientDBIngredientType | null;
  changedRows: AromaRecord[];
  aromaProfileVariants: AromaTableProfile[];
  currentProfileVariant: AromaTableProfile | null;
  updateAromaViz: boolean;
  dataType?: AromaDataType;
}

export interface AromaVariantsResponse {
  profile: AromaTableProfile[];
}

export interface AromaVariantResponse {
  profile: AromaTableProfile;
}

export interface AromaTableProfile extends Omit<IngredientProfile, 'data'> {
  data?: { records?: AromaRecord[] };
}

export interface GenericAromaVizPayload<T> {
  fetch: T;
  productPreparationId?: number;
  version: string;
  dataType?: AromaDataType;
}

export interface LoadAromaVizIngredientDataPayload extends GenericAromaVizPayload<FetchGet<any>> {
  profileName?: string;
}

export interface SetIngredientAromaVizRows {
  aromaVizRows: AromaRecord[];
  type?: AromaDataType;
}

export interface LoadDotGraphIngredientData extends GenericAromaVizPayload<FetchGet<any>> {
  ingredient?: DotGraphFormRecord;
  resetDotGraph?: boolean;
}

export interface SetDotGraphRows {
  dotGraphMainIngredient: DotGraphFormRecord | null;
  dotGraphOtherIngredients?: DotGraphFormRecord[];
  addDotGraphOtherIngredient?: DotGraphFormRecord;
}

export interface PostAromaProfileVariantPayload extends GenericAromaVizPayload<FetchData<any>> {
  profile: AromaTableProfile;
  update?: boolean;
}

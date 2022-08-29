import { PayloadAction } from '@reduxjs/toolkit';
import { call, ForkEffectDescriptor, put, SimpleEffect, takeLatest } from 'redux-saga/effects';

import { FetchGet } from '../../../types';
import { AromaDataType, AromaWheelResponse, IngredientProfile } from '../types';
import {
  convertAromaRecordsToTableRows,
  fetchIngredientAromaVizRows,
  fetchIngredientDotGraphRows,
  getAromaVariants,
  postAromaVariant,
} from './query';
import {
  addAromaProfileVariant,
  loadAromaProfileVariants,
  loadAromaVizRows,
  loadDotGraphRow,
  setAromaVariants,
  setCurrentVariant,
  setDotGraphRows,
  setError,
  setIngredientAromaVizRows,
  setLoading,
} from './reducer';
import {
  AromaVariantsResponse,
  GenericAromaVizPayload,
  LoadAromaVizIngredientDataPayload,
  LoadDotGraphIngredientData,
  PostAromaProfileVariantPayload,
  SetDotGraphRows,
  SetIngredientAromaVizRows,
} from './types';

// Workers
function* getIngredientAromaVizRows(action: PayloadAction<LoadAromaVizIngredientDataPayload>) {
  const { dataType, fetch, version, productPreparationId, profileName } = action?.payload || {};
  yield put(setLoading(true));

  if (productPreparationId && version) {
    try {
      const { aromaVizRows, type }: SetIngredientAromaVizRows = yield call(
        fetchIngredientAromaVizRows,
        fetch,
        version,
        productPreparationId,
        dataType,
        profileName,
      );

      yield put({ type: setIngredientAromaVizRows.type, payload: { aromaVizRows, type: dataType || type } });
    } catch (e: any) {
      yield put({ type: setError.type, payload: { error: e.toString() } });
    }
  }

  yield put(setLoading(false));
}

function* getIngredientDotGraphRows(action: PayloadAction<LoadDotGraphIngredientData>) {
  const { fetch, version, ingredient } = action?.payload || {};
  yield put(setLoading(true));

  if (ingredient?.id && version) {
    try {
      const response: SetDotGraphRows = yield call(fetchIngredientDotGraphRows, fetch, version, ingredient);
      yield put({ type: setDotGraphRows.type, payload: response });
    } catch (e: any) {
      yield put({ type: setError.type, payload: { error: e.toString() } });
    }
  }

  yield put(setLoading(false));
}

function* postAromaProfileVariant(action: PayloadAction<PostAromaProfileVariantPayload>) {
  const { dataType, fetch, version, productPreparationId: prepId, profile, update = false } = action.payload || {};

  yield put(setLoading(true));

  if (prepId) {
    try {
      profile.data = { ...(profile?.data || {}), records: profile?.data?.records || [] };

      const { profile: { name, data } = {} as IngredientProfile }: AromaWheelResponse = yield call(
        postAromaVariant,
        fetch,
        version,
        prepId,
        profile,
        update,
      );

      if (name) {
        const records = convertAromaRecordsToTableRows(prepId, data?.records || [], dataType as AromaDataType);
        yield put(setCurrentVariant({ ...profile, data: { ...(data || {}), records } }));

        if (records.length) {
          yield put({ type: setIngredientAromaVizRows.type, payload: { aromaVizRows: records } });
        }
      }
    } catch (e: any) {
      yield put({ type: setError.type, payload: { error: e.toString() } });
    }
  }

  yield put(setLoading(false));
}

function* fetchAromaProfileVariants(action: PayloadAction<GenericAromaVizPayload<FetchGet<AromaVariantsResponse>>>) {
  const { fetch, version, productPreparationId } = action.payload || {};

  yield put(setLoading(true));

  if (productPreparationId) {
    try {
      const response: AromaVariantsResponse = yield call(getAromaVariants, fetch, version, productPreparationId);
      yield put(setAromaVariants(response?.profile || []));
    } catch (e: any) {
      yield put({ type: setError.type, payload: { error: e.toString() } });
    }
  }

  yield put(setLoading(false));
}

// Watchers
export function* aromaWatcher(): Generator<SimpleEffect<'FORK', ForkEffectDescriptor<never>>, void, unknown> {
  yield takeLatest(loadAromaVizRows.type, getIngredientAromaVizRows);
  yield takeLatest(loadDotGraphRow.type, getIngredientDotGraphRows);
  yield takeLatest(addAromaProfileVariant.type, postAromaProfileVariant);
  yield takeLatest(loadAromaProfileVariants.type, fetchAromaProfileVariants);
}

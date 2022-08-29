import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { SetErrorPayload } from '../../../store/types';
import { FetchGet, IngredientDBIngredientType } from '../../../types';
import { AromaDataType, AromaRecord } from '../types';
import {
  AromaStateType,
  AromaTableProfile,
  GenericAromaVizPayload,
  LoadAromaVizIngredientDataPayload,
  LoadDotGraphIngredientData,
  PostAromaProfileVariantPayload,
  SetDotGraphRows,
  SetIngredientAromaVizRows,
} from './types';

export const SLICE_AROMA_NAME = 'aroma';

const initialState: AromaStateType = {
  aromaVizRows: [],
  error: null,
  loading: false,
  dotGraphMainIngredient: null,
  dotGraphOtherIngredients: [],
  mainIngredient: null,
  changedRows: [],
  aromaProfileVariants: [],
  currentProfileVariant: null,
  updateAromaViz: true,
  dataType: undefined,
};

export const aromaSlice = createSlice({
  name: SLICE_AROMA_NAME,
  initialState,
  reducers: {
    setAromaVizDataType: (state, action: PayloadAction<AromaDataType | undefined>) => {
      state.dataType = action.payload;
    },
    setUpdateAromaViz: (state, action: PayloadAction<boolean>) => {
      state.updateAromaViz = action.payload;
    },
    addAromaProfileVariant: (state, action: PayloadAction<PostAromaProfileVariantPayload>) => {
      state.loading = !!(action.payload.productPreparationId && action.payload.version && action.payload.profile);
      action.payload.dataType = action.payload.dataType || state.dataType;
    },
    loadAromaProfileVariants: (state, action: PayloadAction<GenericAromaVizPayload<FetchGet<any>>>) => {
      state.loading = !!(action.payload.productPreparationId && action.payload.version);
      state.aromaProfileVariants = [];
      state.currentProfileVariant = null;
    },
    setCurrentVariant: (state, action: PayloadAction<AromaTableProfile>) => {
      const variant = state.aromaProfileVariants?.filter((p) => p.name === action.payload.name);

      if (!variant.length) {
        state.aromaProfileVariants = [...state.aromaProfileVariants, action.payload];
      }

      state.currentProfileVariant = action.payload;
    },
    setAromaVariants: (state, action: PayloadAction<AromaTableProfile[]>) => {
      state.aromaProfileVariants = action?.payload || [];
    },
    setChangedRows: (state, action: PayloadAction<AromaRecord[]>) => {
      state.changedRows = action.payload;
    },
    loadAromaVizRows: (state, action: PayloadAction<LoadAromaVizIngredientDataPayload>) => {
      const { productPreparationId, dataType } = action?.payload || {};
      action.payload.dataType = (productPreparationId && dataType) || undefined;

      if (!productPreparationId) {
        state.aromaVizRows = [];
      }
    },
    loadDotGraphRow: (state, action: PayloadAction<LoadDotGraphIngredientData>) => {
      const { resetDotGraph } = action?.payload || {};

      if (resetDotGraph) {
        state.dotGraphMainIngredient = null;
        state.dotGraphOtherIngredients = [];
      }
    },
    reset: () => initialState,
    setDotGraphRows: (state, action: PayloadAction<SetDotGraphRows>) => {
      const { dotGraphMainIngredient, dotGraphOtherIngredients, addDotGraphOtherIngredient } = action?.payload || {};

      if (dotGraphMainIngredient) {
        state.dotGraphMainIngredient = dotGraphMainIngredient;
      }

      if (Array.isArray(dotGraphOtherIngredients)) {
        state.dotGraphOtherIngredients = dotGraphOtherIngredients;
      }

      if (addDotGraphOtherIngredient) {
        state.dotGraphOtherIngredients[addDotGraphOtherIngredient.rowPosition] = addDotGraphOtherIngredient;
      }
    },
    setError: (state, action: PayloadAction<SetErrorPayload>) => {
      const { error } = action?.payload || {};
      state.error = error;
    },
    setIngredientAromaVizRows: (state, action: PayloadAction<SetIngredientAromaVizRows>) => {
      const { aromaVizRows, type } = action?.payload || {};
      if (type) {
        state.dataType = type;
      }
      state.aromaVizRows = aromaVizRows;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setMainIngredient: (state, action: PayloadAction<IngredientDBIngredientType>) => {
      state.mainIngredient = action.payload || null;
    },
  },
});

export default aromaSlice.reducer;

export const {
  addAromaProfileVariant,
  loadAromaProfileVariants,
  loadDotGraphRow,
  loadAromaVizRows,
  reset,
  setDotGraphRows,
  setError,
  setIngredientAromaVizRows,
  setLoading,
  setMainIngredient,
  setAromaVariants,
  setAromaVizDataType,
  setChangedRows,
  setCurrentVariant,
  setUpdateAromaViz,
} = aromaSlice.actions;

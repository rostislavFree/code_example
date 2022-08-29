import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { aromaReducer, SLICE_AROMA_NAME } from '../features/aroma/store';
import { conceptsReducer, SLICE_CONCEPTS_NAME } from '../features/concepts/store';
import { dataSourcesReducer, SLICE_DATASOURCE_NAME } from '../features/datasources/store';
import { projectWorkflowReducer, SLICE_PROJECT_WORKFLOW } from '../features/project/store';
import rootSaga from './root-saga';

const rootReducer = combineReducers({
  [SLICE_DATASOURCE_NAME]: dataSourcesReducer,
  [SLICE_CONCEPTS_NAME]: conceptsReducer,
  [SLICE_AROMA_NAME]: aromaReducer,
  [SLICE_PROJECT_WORKFLOW]: projectWorkflowReducer,
});

const sagaMiddleware = createSagaMiddleware();
const middleware = [sagaMiddleware];

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(...middleware),
});

sagaMiddleware.run(rootSaga);

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

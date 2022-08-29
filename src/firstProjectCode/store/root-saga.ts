import { all, AllEffect, ForkEffectDescriptor, SimpleEffect } from 'redux-saga/effects';

import { aromaWatcher } from '../features/aroma/store';
import { conceptsWatcher } from '../features/concepts/store';
import { versionWatcher } from '../features/datasources/store';
import { projectWorkFlowWatcher } from '../features/project/store/saga';

export default function* rootSaga(): Generator<
  AllEffect<Generator<SimpleEffect<'FORK', ForkEffectDescriptor<never>>, void, unknown>>,
  void,
  unknown
> {
  yield all([versionWatcher(), conceptsWatcher(), aromaWatcher(), projectWorkFlowWatcher()]);
}

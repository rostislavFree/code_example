import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React, { FC, memo, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnyAction, Dispatch } from 'redux';

import { loadAromaVizRows, setCurrentVariant } from '../../../features/aroma/store';
import { AromaTableProfile } from '../../../features/aroma/store/types';
import { FetchGet } from '../../../types';

const PROFILE_VARIANT_QUERY_PARAM = 'variant';
const PROFILE_VARIANT_DEFAULT = 'Default';

type ProfileSelectorProps = {
  availableProfileVariants: AromaTableProfile[];
  containerClassName: string;
  disableSelection?: boolean;
  dispatch: Dispatch<AnyAction>;
  fetch: FetchGet<any>;
  productPreparationId?: number;
  selectedProfile: AromaTableProfile | null;
  version?: string;
};

/* eslint-disable react/no-array-index-key */
const ProfileSelector: FC<ProfileSelectorProps> = ({
  availableProfileVariants,
  containerClassName,
  disableSelection,
  dispatch,
  fetch,
  productPreparationId,
  selectedProfile,
  version,
}) => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const queryParamVariant = useMemo<string | null>(
    () => new URLSearchParams(search).get(PROFILE_VARIANT_QUERY_PARAM) || PROFILE_VARIANT_DEFAULT,
    [search],
  );

  // dispatch add new aroma profile action
  const onProfileChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      const variant = availableProfileVariants.filter((p) => p?.name === event.target.value)[0];

      if (variant?.name && version && productPreparationId) {
        const urlParams = new URLSearchParams(search);
        dispatch(setCurrentVariant(variant));
        dispatch(loadAromaVizRows({ fetch, version, productPreparationId, profileName: variant.name }));

        // change variant query string param
        urlParams.set(PROFILE_VARIANT_QUERY_PARAM, variant.name);
        navigate({ pathname, search: urlParams.toString() }, { replace: true });
      }
    },
    [availableProfileVariants, dispatch, fetch, productPreparationId, version, pathname, search, navigate],
  );

  // preselect default profile variant when page loaded
  useEffect(() => {
    if (!selectedProfile?.name && queryParamVariant) {
      onProfileChange({ target: { value: queryParamVariant } } as SelectChangeEvent<string>);
    }
  }, [selectedProfile?.name, onProfileChange, queryParamVariant]);

  return (
    <>
      <FormControl className={containerClassName} fullWidth>
        <InputLabel id="variant-select-label">Select variant</InputLabel>
        <Select
          labelId="variant-select-label"
          input={<Input id="aroma-variant-select" />}
          displayEmpty
          style={{ height: '40px' }}
          disabled={disableSelection}
          value={selectedProfile?.name || ''}
          onChange={onProfileChange}
          fullWidth
        >
          {availableProfileVariants
            .filter((p) => p.name)
            .map(({ name }) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </>
  );
};

ProfileSelector.defaultProps = { disableSelection: false, version: undefined, productPreparationId: undefined };

export default memo(
  ProfileSelector,
  (p: ProfileSelectorProps, n: ProfileSelectorProps) =>
    JSON.stringify(p.selectedProfile || {}) === JSON.stringify(n.selectedProfile || {}) &&
    p.version === n.version &&
    p.productPreparationId === n.productPreparationId &&
    JSON.stringify(p.availableProfileVariants || []) === JSON.stringify(n.availableProfileVariants || []) &&
    p.disableSelection === n.disableSelection,
);

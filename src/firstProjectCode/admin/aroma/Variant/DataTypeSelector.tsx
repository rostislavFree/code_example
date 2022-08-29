import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { AnyAction, Dispatch } from 'redux';

import { setAromaVizDataType } from '../../../features/aroma/store';
import { AromaDataType, AromaDataTypeFields } from '../../../features/aroma/types';

interface DataTypeSelectorProps {
  availableDataTypes: AromaDataType[];
  containerClassName: string;
  dataType?: AromaDataType;
  dispatch: Dispatch<AnyAction>;
  loading: boolean;
}

const DataTypeSelector: FC<DataTypeSelectorProps> = (props: DataTypeSelectorProps) => {
  const { availableDataTypes, containerClassName, dataType, dispatch, loading } = props;
  const [selected, setSelected] = useState('');
  const onDataTypeChange = useCallback(
    (e: SelectChangeEvent<string>) => dispatch(setAromaVizDataType(e.target.value as AromaDataType)),
    [dispatch],
  );

  // set initial value of data type
  useEffect(() => {
    if (!dataType && availableDataTypes.length) {
      dispatch(setAromaVizDataType(availableDataTypes.length === 1 ? availableDataTypes[0] : AromaDataTypeFields.fd));
    }

    setSelected((value) => dataType || value);
  }, [availableDataTypes, dataType, dispatch]);

  return (
    <FormControl className={containerClassName}>
      <InputLabel id="data-type-select-label"> Data type:</InputLabel>
      <Select
        labelId="data-type-select-label"
        input={<Input id="data-type-select" />}
        value={selected}
        onChange={onDataTypeChange}
        disabled={loading}
        style={{ minWidth: 160 }}
        displayEmpty
      >
        {dataType &&
          availableDataTypes.map(
            (type) =>
              typeof type === 'string' && (
                <MenuItem key={type} value={type}>
                  {type.toUpperCase()}
                </MenuItem>
              ),
          )}
      </Select>
    </FormControl>
  );
};

DataTypeSelector.defaultProps = {
  dataType: undefined,
};

export default DataTypeSelector;

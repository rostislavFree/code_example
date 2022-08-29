import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { DataGrid, GridColumns, GridEditRowsModel, GridToolbar } from '@mui/x-data-grid';
import React, { CSSProperties, FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dispatch } from 'redux';

import { calculateRelativeValue, findAromaRecordInArray, getSumAromaValues } from '../../features/aroma/conversion';
import { loadAromaVizRows, setIngredientAromaVizRows } from '../../features/aroma/store';
import { AromaDataType, AromaDataTypeFields, AromaRecord, DATATYPE_MAP } from '../../features/aroma/types';
import { replaceItemInArray } from '../../shared/utils';
import { FetchGet } from '../../types';

interface AromaTableProps {
  rows: AromaRecord[];
  tableWrapperStyle?: CSSProperties;
  tableClassName?: string;
  fetch: FetchGet<any>;
  dispatch: Dispatch;
  productPreparationId: number;
  saveEditedRows: (records: AromaRecord[]) => void;
  version: string;
  dataType?: AromaDataType;
}

const FIXED_COLUMNS: GridColumns = [
  { field: 'descriptor', headerName: 'Descriptor', width: 200 },
  { field: 'type', headerName: 'Type', width: 250 },
];

const AromaTable: FC<AromaTableProps> = ({
  rows,
  tableWrapperStyle,
  tableClassName,
  fetch,
  dispatch,
  productPreparationId,
  saveEditedRows,
  version,
  dataType,
}) => {
  const [initialRows, setInitialRows] = useState<AromaRecord[]>([]);
  const editRows = useRef<AromaRecord[]>([]);
  const columns = useMemo<GridColumns>(
    () =>
      dataType
        ? [
            ...FIXED_COLUMNS,
            {
              field: dataType,
              headerName: dataType.toUpperCase(),
              width: 250,
              editable: true,
              type: 'number',
              sortable: true,
              valueGetter: ({ value }) => value || 0,
            },
            {
              field: DATATYPE_MAP[dataType],
              headerName: `${dataType.toUpperCase()} normalised`,
              width: 250,
              editable: true,
              type: 'number',
              valueGetter: ({ value }) => value || 0.00001,
            },
          ]
        : FIXED_COLUMNS,
    [dataType],
  );

  // callback to recalculate relative value when cell value changes
  const onCellValueChange = useCallback(
    (editRowsModel: GridEditRowsModel) => {
      if (!dataType) {
        return;
      }

      const relDataType = DATATYPE_MAP[dataType];
      const aromas = [...initialRows];
      let sumAromaValues = getSumAromaValues(rows, dataType);

      Object.keys(editRowsModel).forEach((rowId) => {
        const editRecord = editRowsModel[rowId];
        const idx = aromas.findIndex((row) => Number(row.id) === Number(rowId));

        (Object.keys(editRecord) as AromaDataTypeFields[]).forEach((field) => {
          const relField = DATATYPE_MAP[field];
          const value = Number(editRecord?.[field]?.value);

          if (idx > -1 && relField) {
            const {
              [field]: oldValue = 0,
              [relField]: relValue = 0,
              typeId,
              descriptorId,
            } = findAromaRecordInArray(rows, aromas[idx]);
            const newRelValue = calculateRelativeValue(oldValue, value, relValue, sumAromaValues, field);
            const updated = { ...aromas[idx], [field]: value, [relField]: newRelValue };
            editRows.current = [
              ...editRows.current.filter((i) => i.typeId !== typeId && i.descriptorId !== descriptorId),
              ...(value === rows[idx]?.[field] && newRelValue === rows[idx]?.[relField] ? [] : [updated]),
            ];
            const rowsToSet = replaceItemInArray<AromaRecord>(aromas, updated, idx);
            sumAromaValues = getSumAromaValues(rowsToSet, dataType);
            setInitialRows(rowsToSet.map((row) => ({ ...row, [relDataType]: Number(row[dataType]) / sumAromaValues })));
          }
        });
      });
    },
    [dataType, initialRows, rows],
  );

  useEffect(() => setInitialRows([...rows]), [rows]);

  // discard unsaved changes in table - reload ingredient aroma profile data
  const discardChanges = useCallback(
    () => dispatch(loadAromaVizRows({ fetch, version, productPreparationId, dataType })),
    [dataType, fetch, dispatch, productPreparationId, version],
  );

  // apply changes in table to visualization
  const applyChanges = useCallback(() => {
    dispatch(setIngredientAromaVizRows({ aromaVizRows: [...initialRows] }));
  }, [dispatch, initialRows]);

  // update current aroma profile variant with edited records
  const updateVariant = useCallback(() => saveEditedRows(editRows.current || []), [saveEditedRows]);

  return (
    <div style={tableWrapperStyle}>
      <DataGrid
        rows={initialRows}
        columns={columns}
        components={{
          Toolbar: GridToolbar,
        }}
        autoPageSize
        checkboxSelection
        disableSelectionOnClick
        className={tableClassName}
        onEditRowsModelChange={(editRowsModel) => onCellValueChange(editRowsModel)}
      />
      <Box display="flex" justifyContent="end" p={2}>
        <Button onClick={discardChanges} disabled={!dataType}>
          Discard changes
        </Button>
        <Button onClick={applyChanges} disabled={!dataType}>
          Update
        </Button>
        <Button variant="contained" onClick={updateVariant} disabled={!dataType}>
          Save changes
        </Button>
      </Box>
    </div>
  );
};

AromaTable.defaultProps = {
  dataType: undefined,
  tableWrapperStyle: undefined,
  tableClassName: undefined,
};

export default AromaTable;

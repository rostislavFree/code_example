import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { ExportButton, mockData, scripts, VisualizationWrapperComponent } from 'lab-dataviz';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useFetch } from 'use-http';
import { UseFetch } from 'use-http/dist/cjs/types';

import ErrorNotification from '../../components/ErrorNotification';
import { useSelectIngredientDialog } from '../../components/SelectIngredientDialog';
import { useDataSources } from '../../context/DataSourcesContext';
import { imPatchIngredientJSON, toIngredient } from '../../features/aroma/conversion';
import { loadAromaVizRows, setError, setMainIngredient, SLICE_AROMA_NAME } from '../../features/aroma/store';
import { addAromaProfileVariant, loadAromaProfileVariants, loadDotGraphRow } from '../../features/aroma/store/reducer';
import { AromaDataType, AromaRecord, ConvertedIngredient } from '../../features/aroma/types';
import { getAvailableDataTypes } from '../../features/aroma/utils';
import { VersionList } from '../../features/datasources/DataSources';
import { changeVersion, SLICE_DATASOURCE_NAME } from '../../features/datasources/store';
import makeVersionListStyles from '../../hooks/styles/use-styles';
import { buildActionUrl, TYPE_INGREDIENT_AROMA_VIZ_PAGE } from '../../shared/url';
import { getIngredientsString, ingredientToString } from '../../shared/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import { DataSourceType, IngredientDBIngredientType } from '../../types';
import DotGraph from '../dotgraph/DotGraph';
import AromaTable from './AromaTable';
import useStyles from './use-styles';
import CreateNewVariantDialog from './Variant/CreateNewVariantDialog';
import DataTypeSelector from './Variant/DataTypeSelector';
import ProfileSelector from './Variant/ProfileSelector';

const QUERY_PARAM_PRODUCT_PREPARATION_ID = 'product_preparation_id';
const EXCLUDED_AROMA_WHEEL_TYPES = [
  scripts.ViewType.CustomIngredientViewV1,
  scripts.ViewType.CustomIngredientViewV2,
  scripts.ViewType.CustomTaxonomyView,
];

const { ViewType, patchTaxonomyJSON } = scripts;
const taxonomy = patchTaxonomyJSON(mockData.taxonomy);

function calculateHeight(offset: number, sidePanelClassName = '') {
  let y = offset;

  if (sidePanelClassName) {
    const sidePanel = document.getElementsByClassName(sidePanelClassName)[0];
    y = Number(sidePanel?.firstElementChild?.clientHeight);
  }

  return window.innerHeight - y;
}

const exportSVG: typeof scripts.Renderer.prototype.exportSVG = (querySelector) =>
  (document?.querySelectorAll(querySelector)[0] as SVGElement) || '';

const AromaViz: FC = () => {
  const classes = useStyles();
  const { get, post } = useFetch();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const history = useNavigate();
  const dataSources = useDataSources();
  const {
    aromaVizRows: rows,
    dataType,
    loading,
    mainIngredient,
    error: errorMessage,
    aromaProfileVariants,
    currentProfileVariant,
  } = useAppSelector((store) => store[SLICE_AROMA_NAME]);
  const { coreIngredients, loading: dataSourceLoading } = useAppSelector((store) => store[SLICE_DATASOURCE_NAME]);
  const { version } = useParams<{ version: string }>();
  const { productPreparationId = undefined, name = '', ...restMainIngredient } = mainIngredient || {};
  const queryParamId = Number(new URLSearchParams(location.search).get(QUERY_PARAM_PRODUCT_PREPARATION_ID));
  const coreVersion = useMemo(
    () => [...(dataSources?.versions?.coreVersions || [])].sort((a, b) => parseInt(b, 10) - parseInt(a, 10))[0],
    [dataSources?.versions?.coreVersions],
  );
  const versionToApply = version || coreVersion;
  const [ingredient, setIngredient] = useState<ConvertedIngredient | null>(null);
  const [aromaWheelHeight, setAromaWheelHeight] = useState<number>(0);
  const [aromaWheelWidth, setAromaWheelWidth] = useState<number>(0);
  const [type, setType] = useState<scripts.ViewType | null>(scripts.ViewType.IngredientViewV2);
  const [openCreateVariant, setOpenCreateVariant] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const versionListClasses = makeVersionListStyles({
    dataVersionsContainer: {
      '& > div': { '& > div': { '& > div': { textAlign: 'left' } } },
      '& .MuiAutocomplete-root.MuiAutocomplete-fullWidth': {
        width: 'auto',
      },
    },
  });

  // retrieve main ingredient name id etc
  const mainIngredientData = useMemo<IngredientDBIngredientType>(
    () => coreIngredients.filter((i) => Number(i.productPreparationId) === Number(queryParamId))[0] || {},
    [coreIngredients, queryParamId],
  );

  // retrieve available data types from ingredient aroma records
  const availableDataTypes = useMemo<AromaDataType[]>(() => getAvailableDataTypes<AromaRecord>(rows), [rows]);

  // prepare ingredients selector
  const coreIngredientsStr = useMemo(
    () => getIngredientsString<IngredientDBIngredientType>(coreIngredients, 'productPreparationId'),
    [coreIngredients],
  );

  // callback to select base ingredient
  const handleChangeBaseProduct = useCallback(
    (values: string[]) => {
      const ingredients = values.map((value) => coreIngredients[coreIngredientsStr.indexOf(value)]);
      const { productPreparationId: id } = ingredients[0] || {};
      history({
        pathname: buildActionUrl({ version: versionToApply || '' }, TYPE_INGREDIENT_AROMA_VIZ_PAGE),
        search: id ? `?${QUERY_PARAM_PRODUCT_PREPARATION_ID}=${id}` : '',
      });
    },
    [coreIngredients, coreIngredientsStr, versionToApply, history],
  );

  const { dialog, openDialog } = useSelectIngredientDialog(
    false,
    coreIngredientsStr,
    [
      productPreparationId
        ? ingredientToString<Partial<IngredientDBIngredientType>>('productPreparationId')({
            productPreparationId,
            name,
            ...restMainIngredient,
          })
        : '',
    ].filter(String),
    handleChangeBaseProduct,
    'Select ingredient',
  );

  // callback save edited records to aroma profile
  const handleUpdateAromaProfile = useCallback(
    (records: AromaRecord[]) => {
      if (!currentProfileVariant?.name || currentProfileVariant?.name?.toLowerCase() === 'default') {
        setOpenCreateVariant(true);
        return;
      }

      if (productPreparationId && version && records.length) {
        dispatch(
          addAromaProfileVariant({
            version,
            fetch: post,
            productPreparationId,
            profile: { ...currentProfileVariant, data: { records } },
            update: true,
          }),
        );
      }
    },
    [currentProfileVariant, dispatch, post, productPreparationId, version],
  );

  // callback to change aroma wheel visualization type
  const handleChange = useCallback((event: SelectChangeEvent) => {
    setType(event.target.value as scripts.ViewType);
  }, []);

  // callback to change core version
  const handleChangeCoreVersion = useCallback(
    (value: string) => {
      history({
        pathname: buildActionUrl({ version: value || '' }, TYPE_INGREDIENT_AROMA_VIZ_PAGE),
        search: queryParamId ? `?${QUERY_PARAM_PRODUCT_PREPARATION_ID}=${queryParamId}` : '',
      });
    },
    [history, queryParamId],
  );

  // set product preparation id to store and clean up aroma data on unmount
  useEffect(() => {
    dispatch(setMainIngredient(mainIngredientData));
  }, [dispatch, mainIngredientData]);

  // auto load product aroma data
  useEffect(() => {
    if (productPreparationId && versionToApply && dataType) {
      dispatch(loadAromaVizRows({ fetch: get, version: versionToApply, productPreparationId, dataType }));
    }

    return () => {
      dispatch(loadAromaVizRows({ fetch: get, version: versionToApply, productPreparationId: undefined }));
    };
  }, [dataType, dispatch, get, versionToApply, productPreparationId]);

  // when no version provided in url - add the latest core version
  useEffect(() => {
    if (!version) {
      history(`/data/aroma/${coreVersion}`);
    }
  }, [coreVersion, history, version]);

  // when no version provided in url - add the latest core version
  useEffect(() => {
    setAromaWheelHeight(calculateHeight(0) - 0.5);
    setAromaWheelWidth(window.innerWidth - 369.5);

    setTimeout(() => {
      setAromaWheelHeight(calculateHeight(0));
      setAromaWheelWidth(window.innerWidth - 370);
    });

    window.addEventListener('resize', () => {
      setAromaWheelHeight(calculateHeight(0));
      setAromaWheelWidth(window.innerWidth - 370);
    });

    return () =>
      window.removeEventListener('resize', () => {
        setAromaWheelHeight(calculateHeight(0));
        setAromaWheelWidth(window.innerWidth - 370);
      });
  }, [type, ingredient, rows]);

  // apply version
  useEffect(() => {
    dispatch(
      changeVersion({ version: versionToApply, sourceType: DataSourceType.Core, fetch: { get } as UseFetch<any> }),
    );
    // eslint-disable-next-line
  }, [get, versionToApply]);

  // automatically redraw aroma wheel when rows or id changes
  useEffect(() => {
    setIngredient(null);

    if (rows.length && productPreparationId && dataType) {
      setIngredient(imPatchIngredientJSON(toIngredient(productPreparationId, rows, dataType)));
    }
  }, [rows, productPreparationId, dispatch, dataType]);

  // apply version
  useEffect(() => {
    if (productPreparationId) {
      dispatch(
        loadDotGraphRow({
          fetch: get,
          version: versionToApply,
          ingredient: {
            id: productPreparationId,
            name,
            rowPosition: -1,
            aromaRecords: rows,
            aromaTypes: [],
            aromaTypeToMolecules: {},
          },
        }),
      );
    }
  }, [dispatch, get, name, productPreparationId, rows, versionToApply]);

  // trigger loading of aroma profile variants
  useEffect(() => {
    if (version && queryParamId) {
      dispatch(loadAromaProfileVariants({ fetch: get, productPreparationId: queryParamId, version }));
    }
    // eslint-disable-next-line
  }, [get, dispatch, queryParamId, version]);

  return (
    <>
      <Paper className={classes.ingredientAnalysis}>
        <Typography paragraph variant="h5">
          Ingredient analysis
        </Typography>
        <Box className={classes.block} style={{ padding: 16 }}>
          <Box display="flex" alignItems="center" sx={{ flexShrink: 1 }}>
            {loading && (
              <div className={classes.linearProgressRoot}>
                <LinearProgress variant="query" className={classes.linearProgress} />
              </div>
            )}
            <Grid container justifyItems="baseline" flexDirection="row" rowSpacing={1} spacing={{ xs: 2 }}>
              <Grid item xs={5} sm={3} md={3} lg={2} xl={2} className={classes.versionSelector}>
                <VersionList
                  changeVersion={handleChangeCoreVersion}
                  versions={dataSources.versions.coreVersions}
                  selected={versionToApply}
                  as="autocomplete"
                  required
                  disabled={loading || dataSourceLoading}
                  label={DataSourceType.Core}
                  inputName={DataSourceType.Core}
                />
              </Grid>
              <Grid item xs={7} sm={8} md={8} lg="auto">
                <FormControl className={classes.container} key="form-control" required>
                  <InputLabel id="ingredient-select-label">Select ingredient</InputLabel>
                  <Select
                    fullWidth
                    labelId="ingredient-select-label"
                    displayEmpty
                    placeholder="Select ingredient"
                    style={{ height: '40px', minWidth: 200, maxWidth: 300 }}
                    required
                    disabled={loading}
                    input={<Input id="select-baseProducts-input" />}
                    open={false}
                    onOpen={openDialog}
                    value={productPreparationId || ''}
                  >
                    {productPreparationId && <option value={productPreparationId || ''}>{name}</option>}
                  </Select>
                  {dialog}
                </FormControl>
              </Grid>
              <Grid item xs={5} sm={3} md={3} lg={2} xl={2}>
                <ProfileSelector
                  availableProfileVariants={aromaProfileVariants}
                  dispatch={dispatch}
                  disableSelection={!productPreparationId || !version || loading}
                  fetch={get}
                  selectedProfile={currentProfileVariant}
                  productPreparationId={productPreparationId}
                  version={version}
                  containerClassName=""
                />
              </Grid>
              <Grid
                item
                xs={5}
                sm={3}
                md={3}
                lg={1}
                xl={1}
                style={{ margin: '26px 4px', minWidth: 300, maxWidth: 300 }}
              >
                {!!currentProfileVariant?.description && (
                  <Typography component="div" paragraph={false}>
                    {currentProfileVariant.description}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={5} sm={3} md={3} lg={3} xl={2} style={{ margin: '16px 4px' }}>
                <CreateNewVariantDialog
                  disabled={!version || !productPreparationId || loading}
                  setOpen={setOpenCreateVariant}
                  open={openCreateVariant}
                  dispatch={dispatch}
                  fetch={post}
                  productPreparationId={productPreparationId}
                  version={version || ''}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
      <Paper className={classes.aromaProfile}>
        <Typography paragraph variant="h5">
          Aroma profile
        </Typography>
        <Box className={classes.block} style={{ padding: 16 }}>
          <Box display="flex" alignItems="center">
            {loading && (
              <div className={classes.linearProgressRoot}>
                <LinearProgress variant="query" className={classes.linearProgress} />
              </div>
            )}
            <FormControl className={classes.container} key="form-control">
              <InputLabel key="type-selector-label" id="select-type">
                Select type:
              </InputLabel>
              <Select
                key="type-selector"
                labelId="select-type"
                id="aroma-select-type"
                input={<Input id="aroma-select-type" />}
                value={type || ''}
                label="Select type"
                onChange={handleChange}
                disabled={loading}
              >
                {Object.values(ViewType)
                  .filter((t) => !EXCLUDED_AROMA_WHEEL_TYPES.includes(t))
                  .map((visualizationType) => (
                    <MenuItem key={`menu-item-${visualizationType}`} value={visualizationType as string}>
                      {visualizationType as string}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <DataTypeSelector
              availableDataTypes={availableDataTypes}
              containerClassName={classes.container}
              dataType={dataType}
              loading={loading}
              dispatch={dispatch}
            />
            <div className={classes.container} style={{ maxWidth: 150 }}>
              <ExportButton
                fileName={`${type}_visualisation.svg`}
                type="svg"
                renderer={{ exportSVG: exportSVG.bind(this, [`.${classes.aromaWheelSvgWrapper} svg`]) }}
              >
                <Button variant="contained" type="button" color="primary" disabled={!ingredient || loading} fullWidth>
                  <Box display="flex" alignItems="center">
                    <Typography>Export to SVG</Typography>
                  </Box>
                </Button>
              </ExportButton>
            </div>
          </Box>
          {type && ingredient && Object.keys(ingredient)?.length > 0 ? (
            <Box
              style={{
                minWidth: aromaWheelWidth,
                minHeight: String((aromaWheelWidth > aromaWheelHeight ? aromaWheelHeight : aromaWheelWidth) * 0.9),
              }}
            >
              <VisualizationWrapperComponent
                loading={loading}
                key={type}
                ingredient={ingredient}
                taxonomy={taxonomy}
                canvasClassName={`canvas ${classes.canvas}`}
                canvasPanelClassName={`canvas-panel ${classes.canvasPanel}`}
                svgWrapperClassName={classes.aromaWheelSvgWrapper}
                type={type as scripts.ViewType}
                height={String((aromaWheelWidth > aromaWheelHeight ? aromaWheelHeight : aromaWheelWidth) * 0.9)}
                width={String(aromaWheelWidth)}
                useSvg
              />
            </Box>
          ) : (
            !loading && <h3> Not enough data </h3>
          )}
        </Box>
      </Paper>
      {!!productPreparationId && !!version && (
        <Paper className={classes.aromaData}>
          <Typography paragraph variant="h5">
            Aroma data
          </Typography>
          <AromaTable
            productPreparationId={productPreparationId}
            version={version}
            fetch={get}
            dispatch={dispatch}
            rows={rows}
            tableClassName={classes.table}
            tableWrapperStyle={{ height: '40vh', width: '100%' }}
            saveEditedRows={handleUpdateAromaProfile}
            dataType={dataType}
          />
        </Paper>
      )}
      <Paper className={classes.aromaComparison}>
        <Typography paragraph variant="h5">
          Aroma comparison
        </Typography>
        <Box className={classes.block}>
          <DotGraph
            fetch={get}
            coreIngredients={coreIngredients}
            coreIngredientsStr={coreIngredientsStr}
            loading={loading || dataSourceLoading}
            version={versionToApply}
          />
        </Box>
      </Paper>
      <ErrorNotification error={errorMessage} handleClose={() => dispatch(setError({ error: null }))} />
    </>
  );
};

export default AromaViz;

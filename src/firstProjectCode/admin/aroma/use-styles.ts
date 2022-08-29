import { Theme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    linearProgressRoot: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      position: 'absolute',
      width: '100%',
      zIndex: 1,
    },
    linearProgress: {
      width: theme.spacing(52),
      height: 3,

      '&.MuiLinearProgress-root': {
        position: 'absolute',
        backgroundColor: 'transparent',
        bottom: '-17px',
      },
    },
    navBlock: {
      display: ' flex',
      flexDirection: 'column',
      maxWidth: 300,
      marginLeft: 15,
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 300,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    container: {
      marginRight: theme.spacing(2),
      zIndex: 1,
      minHeight: 98,

      '&.MuiFormControl-root': {
        display: 'block',
      },
    },
    exportButton: {
      position: 'relative',
      zIndex: 1,
      marginBottom: 20,
      padding: 8,
    },
    table: {
      zIndex: 1,
    },
    textField: {
      margin: theme.spacing(1),
      width: 300,
      zIndex: 1,
    },
    textArea: {
      zIndex: 1,
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(2),
    },
    applyButton: {
      zIndex: 1,
    },
    block: {
      width: '100%',
      marginBottom: theme.spacing(1),
      padding: theme.spacing(1),
      marginLeft: theme.spacing(1),

      '& .MuiAutocomplete-root.MuiAutocomplete-fullWidth': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: 0,
          borderBottom: '1px solid',
        },
      },
    },
    versionSelector: {
      '& .MuiAutocomplete-root': {
        paddingLeft: theme.spacing(0),

        '& .MuiOutlinedInput-root': {
          paddingLeft: theme.spacing(0),
          paddingRight: theme.spacing(1),
        },
      },
    },
    loadButton: {
      padding: 8,
      zIndex: 1,
      position: 'relative',
      marginRight: theme.spacing(1),
    },
    canvas: {
      maxWidth: 'calc(100vw - 275px)',
      minHeight: '80vh',
      position: 'absolute',
      zIndex: -1,
    },
    canvasPanel: {
      position: 'relative',
    },
    aromaWheelSvgWrapper: {
      '& svg': {
        maxWidth: '100%',
        height: 'auto',
        // maxHeight: '80vh',
      },
    },
    ingredientAnalysis: {
      '& > div': {
        padding: theme.spacing(2),
      },
      '& > p': {
        padding: theme.spacing(2, 2, 0, 2),
        marginBottom: 0,
      },
      paddingBottom: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    selectVariant: {
      marginTop: theme.spacing(2),
      alignItems: 'end',
    },
    aromaProfile: {
      minHeight: '20vh',
      marginBottom: theme.spacing(2),

      '& > p': {
        padding: theme.spacing(2, 2, 0, 2),
        marginBottom: 0,
      },
    },
    aromaComparison: {
      minHeight: '20vh',

      '& > p': {
        padding: theme.spacing(2, 2, 0, 2),
        marginBottom: 0,
      },
    },
    aromaData: {
      marginBottom: theme.spacing(1),
      paddingBottom: theme.spacing(8.5),
      minHeight: '20vh',

      '& > p': {
        padding: theme.spacing(2, 2, 0, 2),
      },
    },
  }),
);

export default useStyles;

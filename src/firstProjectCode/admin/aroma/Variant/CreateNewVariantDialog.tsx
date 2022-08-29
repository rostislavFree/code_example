import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { ChangeEvent, FC, useCallback, useState } from 'react';
import { Dispatch } from 'redux';
import { FetchData } from 'use-http/dist/cjs/types';

import { addAromaProfileVariant } from '../../../features/aroma/store/reducer';
import { AromaTableProfile } from '../../../features/aroma/store/types';

type CreateNewVariantDialogProps = {
  version?: string;
  disabled?: boolean;
  dispatch: Dispatch;
  fetch: FetchData<any>;
  productPreparationId: number | undefined;
  open?: boolean;
  setOpen: (open: boolean) => void;
};

const defaultProps = { version: '', open: false, disabled: false };

const EMPTY_VARIANT = { name: '', description: '' };

const CreateNewVariantDialog: FC<CreateNewVariantDialogProps & typeof defaultProps> = ({
  disabled,
  dispatch,
  fetch,
  productPreparationId,
  version,
  open,
  setOpen,
}) => {
  const [{ name, description }, setProfile] = useState<AromaTableProfile>(EMPTY_VARIANT);
  const isActionDisabled = !name || !description || !version || !productPreparationId;

  // handle dialog close and reset inputs data
  const onDialogClose = useCallback(() => {
    setOpen(false);
    setProfile(EMPTY_VARIANT);
  }, [setOpen]);

  // handle chane name and description of profile to add
  const onInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name: field, value } = (e?.target || {}) as HTMLInputElement;
    setProfile((profile) => (field ? { ...profile, [field]: value } : profile));
  }, []);

  // dispatch add new aroma profile action
  const addNewAromaProfileVariant = useCallback(() => {
    if (version && productPreparationId && name && description) {
      dispatch(addAromaProfileVariant({ version, fetch, productPreparationId, profile: { name, description } }));
    }
    onDialogClose();
  }, [version, dispatch, description, fetch, name, productPreparationId, onDialogClose]);

  return (
    <>
      <div>
        <Button
          fullWidth
          variant="contained"
          type="button"
          color="primary"
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          <AddIcon />
          <Box display="flex" alignItems="center">
            <Typography>New</Typography>
          </Box>
        </Button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="new-variant-dialog-title">
        <DialogTitle id="new-variant-dialog-title">Add New Variant</DialogTitle>
        <DialogContent>
          <TextField
            required
            value={name}
            onChange={onInputChange}
            autoFocus
            name="name"
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
          />
          <TextField
            required
            value={description}
            onChange={onInputChange}
            margin="dense"
            name="description"
            id="description"
            label="Description"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={addNewAromaProfileVariant} color="primary" disabled={isActionDisabled}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

CreateNewVariantDialog.defaultProps = defaultProps;

export default CreateNewVariantDialog;

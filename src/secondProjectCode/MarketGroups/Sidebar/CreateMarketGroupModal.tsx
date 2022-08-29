import { Button, Input, Modal, Typography } from 'antd';
import ActionBtn from 'components/ActionBtn';
import React, { FC, memo, useState } from 'react';

interface Props {
  disabled: boolean;
  action: (name: string) => void;
}

const CreateMarketGroupModal: FC<Props> = ({ disabled, action }) => {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');

  const showModal = () => setVisible(true);
  const handleClose = () => {
    setName('');
    setVisible(false);
  };
  const createHandler = async () => {
    await action(name);
    handleClose();
  };

  return (
    <>
      <Button type="primary" className="w-100" onClick={showModal} disabled={disabled}>
        Add Market Group
      </Button>
      <Modal
        title="Create Market Group"
        visible={visible}
        onCancel={handleClose}
        footer={[
          <Button key="back" onClick={handleClose}>
            Cancel
          </Button>,
          <ActionBtn key="submit" type="primary" disabled={!name} action={createHandler}>
            Create
          </ActionBtn>,
        ]}
      >
        <Typography className="mb-1">Market Group Name</Typography>
        <Input
          placeholder="Name"
          value={name}
          onChange={({ target }) => setName(target.value.replace(/[^A-Za-z\d\s]/, ''))}
        />
      </Modal>
    </>
  );
};

export default memo(CreateMarketGroupModal);

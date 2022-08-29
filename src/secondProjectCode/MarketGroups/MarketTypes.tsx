import { Typography } from 'antd';
import IMarketType from 'app/Domain/Internal/MarketType';
import Permissions from 'app/Domain/Permissions';
import { ButtonWithPermissions } from 'components/antd';
import Icon from 'components/Icon';
import { MarketGroup } from 'pages/ContentManagement/MarketGroups/Sidebar';
import { FC, memo } from 'react';

import styles from './marketGroup.module.scss';

interface Props {
  groupMarketTypes: MarketGroup['marketTypes'];
  onUpdate: (marketTypes: MarketGroup['marketTypes']) => void;
  sportMarketTypes: IMarketType[];
}

const MarketTypes: FC<Props & Permissions> = ({ groupMarketTypes, sportMarketTypes, onUpdate, permissions }) => {
  const removeMarketType = async (id: number) => {
    const updatedMarketTypes = groupMarketTypes.filter((marketType) => marketType.id !== id);
    onUpdate(updatedMarketTypes);
  };

  return (
    <>
      <Typography className="text-uppercase text-gray-6 mb-4">market types</Typography>
      {groupMarketTypes.map((marketType, index) => (
        <div key={marketType.id} className={styles.marketTypeItem}>
          <b>{sportMarketTypes?.filter((type) => type.id === marketType.id)[0]?.name}</b>
          <span className="text-muted ml-auto mr-1 text-gray-6">{index + 1}</span>
          <ButtonWithPermissions
            type="link"
            permissions={permissions}
            className="p-0 mx-2 text-muted"
            onClick={() => removeMarketType(marketType.id)}
          >
            <Icon name="Trash" style={{ width: 16, height: 16 }} />
          </ButtonWithPermissions>
        </div>
      ))}
    </>
  );
};

export default memo(MarketTypes);

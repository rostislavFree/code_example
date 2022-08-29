import { SearchOutlined } from '@ant-design/icons';
import { Checkbox, Input, Radio, RadioChangeEvent } from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import IMarketType from 'app/Domain/Internal/MarketType';
import clsx from 'clsx';
import ActionBtn from 'components/ActionBtn';
import { SportBadge } from 'components/Badges';
import { MarketGroup } from 'pages/ContentManagement/MarketGroups/Sidebar';
import styles from 'pages/TradingTemplates/TradingTemplateDetails/TradingTemplateDetails.module.scss';
import { memo, useMemo, useState } from 'react';

interface Props {
  marketGroup: MarketGroup;
  onUpdate: (marketTypes: MarketGroup['marketTypes']) => void;
  sportMarketTypes: IMarketType[];
}

enum GroupNames {
  all = 'All',
  inGroup = 'In Group',
}

const MarketTypesPanel = ({ sportMarketTypes, marketGroup, onUpdate }: Props) => {
  const [group, setGroup] = useState<GroupNames>(GroupNames.all);
  const [search, setSearch] = useState<string>();
  const [checkedMarketTypes, setCheckedMarketTypes] = useState<Pick<IMarketType, 'id' | 'parameters'>[]>(
    marketGroup.marketTypes,
  );

  const marketTypes = useMemo(() => {
    return sportMarketTypes.reduce((acc, marketType) => {
      const withinSearch = !search || marketType.name.toLowerCase().includes(search);
      const withinTab = group === GroupNames.all || marketGroup.marketTypes.some((mt) => mt.id === marketType.id);
      const withAllParams = marketGroup.requiredParameters.every((param) => marketType.parameters.includes(param));
      if (withinSearch && withinTab && withAllParams) {
        acc.push(marketType);
      }
      return acc;
    }, [] as IMarketType[]);
  }, [search, group, sportMarketTypes, marketGroup.marketTypes, marketGroup.requiredParameters]);

  const groupChangeHandler = (e: RadioChangeEvent) => {
    setGroup(e.target.value);
  };

  const onCheckMarketTypes = (checkedValues: CheckboxValueType[]) => {
    const marketTypes = sportMarketTypes.filter((marketType) => checkedValues.includes(marketType.id));
    setCheckedMarketTypes(marketTypes);
  };

  return (
    <>
      <div className={clsx(styles.EditAssignmentHeader, 'pb-2')}>
        <h4>Add market types to the market group</h4>
        <div className="d-flex align-items-center">
          <h6>{marketGroup?.name}</h6>
          <SportBadge color="default" className="ml-2">
            {marketGroup?.sportId}
          </SportBadge>
        </div>
        <Radio.Group
          defaultValue={GroupNames.all}
          buttonStyle="solid"
          name="filter"
          className={styles.LeaguesFilters}
          onChange={groupChangeHandler}
          value={group}
        >
          <Radio.Button value={GroupNames.all}>All</Radio.Button>
          <Radio.Button value={GroupNames.inGroup}>In Group</Radio.Button>
        </Radio.Group>
        <Input
          placeholder="Start typing to search"
          prefix={<SearchOutlined />}
          className={styles.LeaguesSearch}
          onChange={({ target }) => setSearch(target.value)}
          value={search}
        />
      </div>
      <div className="overflow-auto">
        <Checkbox.Group
          options={marketTypes.map((mt) => ({ label: mt.name, value: mt.id }))}
          defaultValue={marketGroup.marketTypes.map((mt) => mt.id)}
          onChange={onCheckMarketTypes}
          className="d-flex flex-column ml-4"
        />
      </div>
      <div className={styles.EditAssignmentFooter}>
        <span>
          Types: <b>{sportMarketTypes?.length}</b>
        </span>
        <ActionBtn
          type="primary"
          action={() => {
            const marketTypes = checkedMarketTypes.map((market) => ({ id: market.id, parameters: market.parameters }));
            onUpdate(marketTypes);
          }}
        >
          Add Market Types
        </ActionBtn>
      </div>
    </>
  );
};

export default memo(MarketTypesPanel);

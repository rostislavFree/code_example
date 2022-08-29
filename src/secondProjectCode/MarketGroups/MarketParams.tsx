import { message, Select, Spin, Tag, Typography } from 'antd';
import IMarketType from 'app/Domain/Internal/MarketType';
import { backOfficeAxiosClient } from 'app/services/api';
import { marketGroupsApi } from 'app/services/api.routes';
import { EnvMarketGroups } from 'pages/ContentManagement/MarketGroups/index';
import { MarketGroup } from 'pages/ContentManagement/MarketGroups/Sidebar';
import { FC, useMemo, useState } from 'react';

interface Props {
  marketGroupId: MarketGroup['id'];
  requiredParameters: MarketGroup['requiredParameters'];
  onUpdate: (prevState: MarketGroup) => void;
  sportMarketTypes: IMarketType[];
  envMarketGroups: EnvMarketGroups;
}

const updateParameters = async ({
  requiredParameters,
  id,
  envMarketGroups,
}: Pick<Props, 'envMarketGroups' | 'requiredParameters'> & { id: number }) =>
  await backOfficeAxiosClient.put(marketGroupsApi.parameters({ id, envMarketGroups }), {
    requiredParameters,
    forbiddenParameters: [],
  });

const MarketParams: FC<Props> = ({
  requiredParameters,
  marketGroupId,
  sportMarketTypes,
  onUpdate,
  envMarketGroups,
}) => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');

  const defaultSportParams = useMemo(() => {
    const parameters: string[] = [];
    sportMarketTypes.forEach((marketType) => parameters.push(...marketType.parameters));
    return Array.from(new Set(parameters));
  }, [sportMarketTypes]);

  const selectParameter = async (value: string) => {
    setLoading(true);
    try {
      const { data } = await updateParameters({
        envMarketGroups,
        requiredParameters: [...requiredParameters, value],
        id: marketGroupId,
      });
      onUpdate(data);
    } catch {
      message.error('Failed to add parametr');
    }
    setLoading(false);
    setValue('');
  };

  const removeParameter = async (value: string) => {
    setLoading(true);
    try {
      const { data } = await updateParameters({
        envMarketGroups,
        requiredParameters: requiredParameters.filter((param) => param !== value),
        id: marketGroupId,
      });
      onUpdate(data);
    } catch {
      message.error('Failed to remove parametr');
    }
    setLoading(false);
    setValue('');
  };

  return (
    <>
      <Typography className="text-uppercase text-gray-6 mb-4">set required market parameters</Typography>
      <div className="rounded bg-gray-1 p-4">
        <Select
          placeholder="Select parameter to add"
          className="w-100 mb-3"
          value={value}
          onSelect={(value: any) => selectParameter(value as string)}
          showSearch
        >
          <Select.Option value={null} disabled>
            Select parameter to add
          </Select.Option>
          {defaultSportParams
            .filter((p) => !requiredParameters.includes(p))
            .map((param) => (
              <Select.Option key={param} value={param}>
                {param}
              </Select.Option>
            ))}
        </Select>
        <div className="d-flex align-items-center flex-wrap">
          {requiredParameters.map((param) => (
            <Tag key={param} closable onClose={() => removeParameter(param)} className="mr-2 mb-2">
              {param}
            </Tag>
          ))}
          {loading && <Spin />}
        </div>
      </div>
    </>
  );
};

export default MarketParams;

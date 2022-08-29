import { message, Row, Spin } from 'antd';
import IFilters from 'app/Domain/Filters';
import Permissions from 'app/Domain/Permissions';
import { backOfficeAxiosClient } from 'app/services/api';
import { marketGroupsApi } from 'app/services/api.routes';
import { storageGeneral } from 'app/storage';
import { sportsStore } from 'app/store/SportsStore';
import DraggableItem from 'components/DraggableItem';
import usePermissions from 'components/hooks/usePermissions';
import SportSelect from 'components/Select/SportSelect';
import { observer } from 'mobx-react';
import { EnvMarketGroups } from 'pages/ContentManagement/MarketGroups/index';
import CreateMarketGroupModal from 'pages/ContentManagement/MarketGroups/Sidebar/CreateMarketGroupModal';
import { FC, memo, useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

interface Props {
  selected?: MarketGroup;
  select: (market: MarketGroup | undefined) => void;
  envMarketGroups: EnvMarketGroups;
}

interface MarketGroupListProps extends Omit<Props, 'envMarketGroups'> {
  marketGroups: MarketGroup[];
  updateOrder: (marketGroups: MarketGroup[]) => void;
  disabled: boolean;
  removeHandler: (id: number) => void;
}

export interface MarketGroup {
  forbiddenParameters: string[];
  id: number;
  marketTypes: {
    id: number;
    parameters: string[];
  }[];
  name: string;
  order: number;
  requiredParameters: string[];
  sportId: number;
}

const sortByOrder = (data: MarketGroup[]) => data.sort((a, b) => a.order - b.order);

const MarketGroupList: FC<MarketGroupListProps> = memo(
  ({ marketGroups, select, selected, updateOrder, disabled, removeHandler }) => {
    if (marketGroups.length === 0) {
      return <div className="d-flex justify-content-center text-muted">No market groups to display</div>;
    }

    return (
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const [removed] = marketGroups.splice(result.source.index, 1);
          marketGroups.splice(result.destination.index, 0, removed);
          const ordersToUpdate = marketGroups.map((market, index) => ({ ...market, order: index + 1 }));
          updateOrder(ordersToUpdate);
        }}
      >
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="mx-n2 px-2 overflow-auto">
              {marketGroups.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id.toString()} index={index} isDragDisabled={disabled}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={provided.draggableProps.style}
                      onClick={() => select(item)}
                    >
                      <DraggableItem
                        removable
                        isSelected={item.id === selected?.id}
                        name={item.name}
                        index={index + 1}
                        isDragging={snapshot.isDragging}
                        removeHandler={() => removeHandler(item.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  },
);

const Sidebar = observer(({ selected, select, permissions, envMarketGroups }: Props & Permissions) => {
  const { hasPermission } = usePermissions();
  const isAuthorized = hasPermission(permissions);

  const [filters, setFilters] = useState<IFilters>();
  const [loading, setLoading] = useState(false);
  const [selectedMarketGroup, setSelectedMarketGroup] = useState<MarketGroup>();
  const [marketGroups, setMarketGroups] = useState<MarketGroup[]>([]);

  useEffect(() => {
    const initializeFilters = async () => await storageGeneral.getItem<IFilters>('MARKET_GROUPS_SPORT_FILTER');

    initializeFilters().then((sportFilters) => {
      setFilters((prevState) => sportFilters || prevState);
    });
  }, []);

  useEffect(() => {
    storageGeneral.setItem('MARKET_GROUPS_SPORT_FILTER', filters);
  }, [filters]);

  const updateOrdering = useCallback(
    async (marketGroups: MarketGroup[]) => {
      const { data } = await backOfficeAxiosClient.put<MarketGroup[]>(marketGroupsApi.ordering({ envMarketGroups }), {
        marketGroups,
        sportId: filters?.sportId,
      });
      setMarketGroups(sortByOrder(data));
    },
    [envMarketGroups, filters?.sportId],
  );

  const removeMarketGroup = useCallback(
    async (id: number) => {
      setLoading(true);
      const { data } = await backOfficeAxiosClient.delete<MarketGroup[]>(
        marketGroupsApi.marketGroupById({ id, envMarketGroups }),
      );
      setMarketGroups(sortByOrder(data));
      if (id === selected?.id) {
        select(undefined);
      }
      setLoading(false);
    },
    [envMarketGroups, select, selected?.id],
  );

  const createMarketGroup = useCallback(
    async (name: string) => {
      try {
        const { data } = await backOfficeAxiosClient.post<MarketGroup[]>(
          marketGroupsApi.marketGroups({ envMarketGroups }),
          {
            name,
            sportId: filters?.sportId,
          },
        );
        setMarketGroups(sortByOrder(data));
        message.success('Market group successfully created.');
      } catch (e: any) {
        message.error(
          `Failed to create market group. ${e.status === 400 ? `Market group ${name} already exists` : e.message}`,
        );
      }
    },
    [envMarketGroups, filters?.sportId],
  );

  const onMarketGroupSelect = useCallback(
    (marketGroup?: MarketGroup) => {
      setSelectedMarketGroup(marketGroup);
      select(marketGroup);
    },
    [select],
  );

  useEffect(() => {
    const loadMarketGroups = async (sportId: number) => {
      setLoading(true);

      const { data } = await backOfficeAxiosClient.get(
        marketGroupsApi.marketGroupsBySportId({ envMarketGroups, sportId }),
      );

      return data;
    };

    if (filters?.sportId) {
      loadMarketGroups(filters?.sportId).then((r) => {
        setMarketGroups(sortByOrder(r));
        select(undefined);
        setLoading(false);
      });
    }
  }, [envMarketGroups, filters?.sportId, select]);

  return sportsStore.sports.length ? (
    <>
      <SportSelect
        placeholder="Select sport"
        onChange={(sportId) => setFilters((prevFilters) => ({ ...prevFilters, sportId }))}
        value={filters?.sportId}
        showSearch
        withPlaceholderOption={false}
      />
      <div className="mt-2 mb-3">
        <CreateMarketGroupModal disabled={!filters} action={createMarketGroup} />
      </div>
      <Row
        justify="space-between"
        style={{ fontSize: 12 }}
        className="bg-gray-3 text-muted text-uppercase px-3 py-2 mx-n2 mb-2"
      >
        <small>Group</small>
        <small>Order</small>
      </Row>
      {loading ? (
        <Spin />
      ) : (
        <MarketGroupList
          select={onMarketGroupSelect}
          selected={selectedMarketGroup}
          marketGroups={marketGroups}
          updateOrder={updateOrdering}
          disabled={!isAuthorized}
          removeHandler={removeMarketGroup}
        />
      )}
    </>
  ) : null;
});

export default memo(Sidebar);

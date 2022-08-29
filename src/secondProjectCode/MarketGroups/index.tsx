import { Alert, Col, message, Row, Spin } from 'antd';
import IMarketType from 'app/Domain/Internal/MarketType';
import { backOfficeAxiosClient } from 'app/services/api';
import { marketGroupsApi, schemaApi } from 'app/services/api.routes';
import { ButtonWithPermissions } from 'components/antd';
import PageLayout from 'components/Page';
import SlideRightPanel from 'components/SlideRightPanel';
import MarketTypes from 'pages/ContentManagement/MarketGroups/MarketTypes';
import MarketTypesPanel from 'pages/ContentManagement/MarketGroups/MarketTypesPanel';
import { difference } from 'rambdax';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import MarketParams from './MarketParams';
import Sidebar, { MarketGroup } from './Sidebar';

export enum EnvMarketGroups {
  frontend = 'market-groups',
  backoffice = 'backoffice-market-groups',
}

const MarketGroupPage = () => {
  const [sportMarketTypes, setSportMarketTypes] = useState<IMarketType[]>([]);
  const [selectedMarketGroup, setSelectedMarketGroup] = useState<MarketGroup>();
  const [loading, setLoading] = useState(false);
  const { envType } = useParams<{ envType: 'backoffice' | 'frontend' }>();
  const envMarketGroups = envType === 'backoffice' ? EnvMarketGroups.backoffice : EnvMarketGroups.frontend;

  useEffect(() => {
    if (!selectedMarketGroup?.sportId) return;
    const loadMarketTypes = async () => {
      try {
        const { data } = await backOfficeAxiosClient.get<IMarketType[]>(schemaApi.internalsMarketTypes, {
          params: { sportId: selectedMarketGroup.sportId },
        });
        setSportMarketTypes(data);
      } catch {
        console.log(`Failed to load market types for sport ${selectedMarketGroup?.sportId}`);
      }
    };
    loadMarketTypes();
  }, [selectedMarketGroup?.sportId]);

  const getSelectedMarketGroup = useCallback(
    async (marketGroup?: MarketGroup) => {
      if (!marketGroup) {
        setSelectedMarketGroup(undefined);
        return;
      }
      setLoading(true);
      try {
        const { data } = await backOfficeAxiosClient.get(
          marketGroupsApi.marketGroupById({ id: marketGroup.id, envMarketGroups }),
        );
        setSelectedMarketGroup(data);
      } catch {
        message.error('Failed to load market group details.');
      }
      setLoading(false);
    },
    [envMarketGroups],
  );

  const updateMarketTypes = useCallback(
    async (newMarketTypes: MarketGroup['marketTypes']) => {
      if (!selectedMarketGroup) return;
      try {
        const { id, marketTypes: selectedMarketTypes } = selectedMarketGroup;
        let action = 'market-types';
        let marketTypes = newMarketTypes;
        const isBackoffice = envMarketGroups === EnvMarketGroups.backoffice;

        if (isBackoffice) {
          const backofficeAction =
            selectedMarketTypes.length > newMarketTypes.length ? 'remove-market-types' : 'assign-market-types';
          const backofficeMarketTypes =
            backofficeAction === 'remove-market-types'
              ? difference(selectedMarketTypes, newMarketTypes)
              : difference(newMarketTypes, selectedMarketTypes);

          action = backofficeAction;
          marketTypes = backofficeMarketTypes;
        }

        const { data } = await backOfficeAxiosClient.put<MarketGroup>(
          marketGroupsApi.marketTypes({ action, envMarketGroups, id }),
          { marketTypes },
        );
        setSelectedMarketGroup(data);
      } catch (e: any) {
        message.error(`Failed to update market types. ${e.message}`);
      }
    },
    [envMarketGroups, selectedMarketGroup],
  );

  const renderMarketGroup = () => {
    if (!selectedMarketGroup) {
      return (
        <Row className="h-100" align="middle" justify="center">
          <Alert className="m-auto" message="Select Market Group to continue" type="info" />
        </Row>
      );
    }

    if (loading) {
      return (
        <div className="d-flex w-100 justify-content-center h-100 align-items-center">
          <Spin />
        </div>
      );
    }

    return (
      <Row gutter={0}>
        <Col flex="auto" className="px-2 mb-3">
          <MarketTypes
            permissions="edit:cms"
            sportMarketTypes={sportMarketTypes}
            groupMarketTypes={selectedMarketGroup.marketTypes}
            onUpdate={updateMarketTypes}
          />
        </Col>
        <Col flex="450px" className="px-2">
          <MarketParams
            marketGroupId={selectedMarketGroup.id}
            sportMarketTypes={sportMarketTypes}
            requiredParameters={selectedMarketGroup.requiredParameters}
            onUpdate={setSelectedMarketGroup}
            envMarketGroups={envMarketGroups}
          />
        </Col>
      </Row>
    );
  };

  return (
    <PageLayout
      header={
        <>
          <h1>Application Market Groups</h1>
          <div className="ml-auto">
            {selectedMarketGroup ? (
              <SlideRightPanel
                renderButton={(panelOpen) => (
                  <ButtonWithPermissions
                    type="primary"
                    permissions="edit:cms"
                    className="mx-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      panelOpen();
                    }}
                    disabled={!selectedMarketGroup}
                  >
                    Add Market Type
                  </ButtonWithPermissions>
                )}
                innerComponent={(close) => (
                  <MarketTypesPanel
                    sportMarketTypes={sportMarketTypes}
                    marketGroup={selectedMarketGroup}
                    onUpdate={(marketTypes) => updateMarketTypes(marketTypes).then(() => close())}
                  />
                )}
              />
            ) : null}
          </div>
        </>
      }
      sidebar={
        <Sidebar
          permissions="edit:cms"
          selected={selectedMarketGroup}
          select={getSelectedMarketGroup}
          envMarketGroups={envMarketGroups}
        />
      }
    >
      {renderMarketGroup()}
    </PageLayout>
  );
};

export default MarketGroupPage;

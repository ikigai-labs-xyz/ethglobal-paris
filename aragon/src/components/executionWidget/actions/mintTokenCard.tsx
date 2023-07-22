import {IconLinkExternal, Link, ListItemAddress} from '@aragon/ods';
import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {CHAIN_METADATA} from 'utils/constants';
import {Web3Address} from 'utils/library';
import {ActionMintToken} from 'utils/types';

export const MintTokenCard: React.FC<{
  action: ActionMintToken;
}> = ({action}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {infura: provider} = useProviders();

  const {data: daoDetails} = useDaoDetailsQuery();

  const {
    data: {members},
  } = useDaoMembers(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const [addresses, setAddresses] = useState<Web3Address[]>([]);

  const newTotalSupply = action.summary.newTokens + action.summary.tokenSupply;

  const newHolders = action.inputs.mintTokensToWallets.filter(
    ({web3Address}) => {
      return members.find(
        (addr: {address: string}) =>
          addr.address.toLowerCase() !== web3Address.address?.toLowerCase()
      );
    }
  );

  /*************************************************
   *                    Effects                    *
   *************************************************/
  useEffect(() => {
    async function mapToWeb3Addresses() {
      try {
        const response = await Promise.all(
          action.inputs.mintTokensToWallets.map(
            async ({web3Address: {address, ensName}}) =>
              await Web3Address.create(provider, {address, ensName})
          )
        );

        setAddresses(response);
      } catch (error) {
        console.error('Error creating Web3Addresses', error);
      }
    }

    if (action.inputs.mintTokensToWallets) mapToWeb3Addresses();
  }, [action.inputs.mintTokensToWallets, network, provider]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleAddressClick = useCallback(
    (addressOrEns: string | null) =>
      window.open(
        `${CHAIN_METADATA[network].explorer}address/${addressOrEns}`,
        '_blank'
      ),
    [network]
  );

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.mintTokens')}
      smartContractName={t('labels.aragonOSx')}
      verified
      methodDescription={t('newProposal.mintTokens.methodDescription')}
      additionalInfo={t('newProposal.mintTokens.additionalInfo')}
    >
      <Container>
        <div className="p-2 tablet:p-3 space-y-2 bg-ui-50">
          {action.inputs.mintTokensToWallets.map(
            ({web3Address, amount}, index) => {
              const label =
                web3Address.ensName ||
                addresses[index]?.ensName ||
                web3Address.address;

              const avatar = addresses[index]?.avatar || web3Address.address;
              const percentage = (Number(amount) / newTotalSupply) * 100;

              return web3Address.address ? (
                <ListItemAddress
                  key={web3Address.address}
                  label={label}
                  src={avatar}
                  onClick={() => handleAddressClick(label)}
                  tokenInfo={{
                    amount: parseFloat(Number(amount).toFixed(2)),
                    symbol: action.summary.daoTokenSymbol || '',
                    percentage: parseFloat(percentage.toFixed(2)),
                  }}
                />
              ) : null;
            }
          )}
        </div>

        <SummaryContainer>
          <p className="font-bold text-ui-800">{t('labels.summary')}</p>
          <HStack>
            <Label>{t('labels.newTokens')}</Label>
            <p>
              +{action.summary.newTokens} {action.summary.daoTokenSymbol}
            </p>
          </HStack>
          <HStack>
            <Label>{t('labels.newHolders')}</Label>
            <p>+{newHolders?.length}</p>
          </HStack>
          <HStack>
            <Label>{t('labels.totalTokens')}</Label>
            <p>
              {newTotalSupply} {action.summary.daoTokenSymbol}
            </p>
          </HStack>
          <HStack>
            <Label>{t('labels.totalHolders')}</Label>
            <p>
              {newHolders?.length +
                (action.summary.totalMembers || members?.length)}{' '}
            </p>
          </HStack>
          {/* TODO add total amount of token holders here. */}
          <Link
            label={t('labels.seeCommunity')}
            href={`${CHAIN_METADATA[network].explorer}/token/tokenholderchart/${action.summary.daoTokenAddress}`}
            iconRight={<IconLinkExternal />}
          />
        </SummaryContainer>
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-ui-50 border divide-y border-ui-100 divide-ui-100 rounded-b-xl border-t-0',
})``;

const SummaryContainer = styled.div.attrs({
  className: 'p-2 tablet:p-3 space-y-1.5 font-bold text-ui-800',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between',
})``;

const Label = styled.p.attrs({
  className: 'font-normal text-ui-500',
})``;

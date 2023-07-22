import React, {useMemo, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {AlertCard, IconSpinner, Spinner, shortenAddress} from '@aragon/ods';

import {Dd, Dl} from 'components/descriptionList';
import {useFormContext, useWatch} from 'react-hook-form';
import {gTokenSymbol} from 'utils/tokens';
import {getTotalHolders} from 'services/covalentAPI';
import {useNetwork} from 'context/network';
import {QueryClient} from '@tanstack/react-query';
import numeral from 'numeral';

type TransferListProps = {
  tokenAddress: string;
};

const VerificationCard: React.FC<TransferListProps> = ({tokenAddress}) => {
  const {t} = useTranslation();
  const {control, setValue, resetField} = useFormContext();
  const [
    tokenName,
    tokenSymbol,
    tokenTotalSupply,
    tokenTotalHolders,
    tokenType,
  ] = useWatch({
    name: [
      'tokenName',
      'tokenSymbol',
      'tokenTotalSupply',
      'tokenTotalHolders',
      'tokenType',
    ],
    control: control,
  });
  const {network} = useNetwork();

  const [isTotalHoldersLoading, setIsTotalHoldersLoading] = useState(true);

  useEffect(() => {
    async function fetchTotalHolders() {
      try {
        setIsTotalHoldersLoading(true);
        resetField('tokenTotalHolders');
        const queryClient = new QueryClient();
        const total = await getTotalHolders(queryClient, tokenAddress, network);
        setValue('tokenTotalHolders', total);
      } catch (e) {
        console.error(e);
      } finally {
        setIsTotalHoldersLoading(false);
      }
    }

    fetchTotalHolders();
  }, [network, resetField, setValue, tokenAddress]);

  useEffect(() => {
    if (tokenType === 'governance-ERC20') setValue('eligibilityTokenAmount', 1);
  }, [tokenType, setValue]);

  const Alert = useMemo(() => {
    switch (tokenType) {
      case 'ERC-20':
        return (
          <AlertCard
            mode="warning"
            title={t(
              'createDAO.step3.existingToken.verificationAlertWarningTitle'
            )}
            helpText={t(
              'createDAO.step3.existingToken.verificationAlertWarningDescription',
              {
                tokenSymbol,
                gTokenSymbol: gTokenSymbol(tokenSymbol),
              }
            )}
          />
        );
      case 'governance-ERC20':
        return (
          <AlertCard
            mode="success"
            title={t(
              'createDAO.step3.existingToken.verificationAlertSuccessTitle'
            )}
            helpText={t(
              'createDAO.step3.existingToken.verificationAlertSuccessDescription'
            )}
          />
        );
      case 'ERC-1155':
      case 'ERC-721':
        return (
          <AlertCard
            mode="critical"
            title={t(
              'createDAO.step3.existingToken.verificationAlertCriticalTitle'
            )}
            helpText={t(
              'createDAO.step3.existingToken.verificationAlertCriticalDescription'
            )}
          />
        );
      case 'Unknown':
        return (
          <AlertCard
            mode="critical"
            title={t(
              'createDAO.step3.existingToken.verificationAlertCriticalTitle'
            )}
            helpText={t(
              'createDAO.step3.existingToken.verificationAlertCriticalDescription'
            )}
          />
        );
      default:
        return null;
    }
  }, [t, tokenSymbol, tokenType]);

  const formattedTokenTotalSupply = useMemo(() => {
    if (tokenTotalSupply < 100) {
      return numeral(tokenTotalSupply).format('0,0.[000]');
    }

    // More than 100 trillion (otherwise formatting fails on bigger numbers)
    if (tokenTotalSupply > 1e14) {
      return '> 100t';
    }

    const totalSupplyString = tokenTotalSupply.toLocaleString('fullwide', {
      useGrouping: false,
    });

    return numeral(totalSupplyString).format('0.[00]a');
  }, [tokenTotalSupply]);

  const formattedTokenTotalHolders = useMemo(() => {
    if (!tokenTotalHolders) return '-';

    // More than 100 trillion (otherwise formatting fails on bigger numbers)
    if (tokenTotalHolders > 1e14) {
      return '> 100t';
    }

    const tokenTotalHoldersString = tokenTotalHolders.toLocaleString(
      'fullwide',
      {
        useGrouping: false,
      }
    );

    return numeral(tokenTotalHoldersString).format('0.[00]a');
  }, [tokenTotalHolders]);

  if (!tokenType)
    return (
      <VerifyContainer>
        <VerifyTitle>{shortenAddress(tokenAddress)}</VerifyTitle>
        <LoadingWrapper>
          <Spinner size={'xs'} />
          {t('createDAO.step3.existingToken.verificationLoading')}
        </LoadingWrapper>
      </VerifyContainer>
    );

  return (
    <VerifyWrapper>
      <VerifyContainer>
        <VerifyTitle>
          {tokenName !== '' && tokenType !== 'Unknown'
            ? `${tokenName} (${tokenSymbol})`
            : shortenAddress(tokenAddress)}
        </VerifyTitle>
        <VerifyItemsWrapper>
          <Dl>
            <Dt>
              {t('createDAO.step3.existingToken.verificationLabelStandard')}
            </Dt>
            <Dd>{tokenType === 'governance-ERC20' ? 'ERC-20' : tokenType}</Dd>
          </Dl>
          {tokenType !== 'Unknown' && (
            <>
              <Dl>
                <Dt>
                  {t('createDAO.step3.existingToken.verificationLabelSupply')}
                </Dt>
                <Dd>
                  {formattedTokenTotalSupply} {tokenSymbol}
                </Dd>
              </Dl>
              <Dl>
                <Dt>
                  {t('createDAO.step3.existingToken.verificationLabelHolders')}
                </Dt>
                {isTotalHoldersLoading ? (
                  <dd className="flex items-center" style={{width: '70%'}}>
                    <IconSpinner className="w-1.5 desktop:w-2 h-1.5 desktop:h-2 text-primary-500 animate-spin" />
                  </dd>
                ) : (
                  <Dd>{formattedTokenTotalHolders}</Dd>
                )}
              </Dl>
            </>
          )}
        </VerifyItemsWrapper>
        {Alert}
      </VerifyContainer>
    </VerifyWrapper>
  );
};

export default VerificationCard;

const VerifyContainer = styled.div.attrs({
  className: 'flex flex-col space-y-3 p-3 bg-ui-0 rounded-xl',
})``;

const VerifyWrapper = styled.div.attrs({
  className: 'space-y-6',
})``;

const LoadingWrapper = styled.div.attrs({
  className: 'flex py-3 text-primary-400 gap-x-1 items-center',
})``;

const VerifyTitle = styled.h2.attrs({
  className: 'ft-text-lg font-bold text-800',
})``;

const VerifyItemsWrapper = styled.div.attrs({
  className: 'flex flex-col tablet:gap-x-2 gap-y-1.5',
})``;

const Dt = styled.dt.attrs({
  className: 'flex items-center text-ui-800',
})``;

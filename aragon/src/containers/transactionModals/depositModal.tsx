import {AlertInline, ButtonText} from '@aragon/ods';
import React, {useCallback, useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA, ENS_SUPPORTED_NETWORKS} from 'utils/constants';
import {toDisplayEns} from 'utils/library';
import {AllTransfers} from 'utils/paths';

const DepositModal: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isDepositOpen, open, close} = useGlobalModalContext();
  const {status, isConnected, isOnWrongNetwork} = useWallet();

  const {data: daoDetails} = useDaoDetailsQuery();

  const networkSupportsENS = ENS_SUPPORTED_NETWORKS.includes(network);

  // NOTE: This login => network flow can and should be extracted
  // if later on we have a component that requires the same process
  const loginFlowTriggeredRef = useRef(false);

  /*************************************************
   *                Hooks & Effects                *
   *************************************************/
  // Show login modal or network modal based on connection status
  useEffect(() => {
    if (loginFlowTriggeredRef.current) {
      if (!isConnected) open('wallet');
      else {
        if (isOnWrongNetwork) open('network');
        else close('network');
      }
    }
  }, [close, isConnected, isOnWrongNetwork, open]);

  // Close the login modal once the status is connecting
  useEffect(() => {
    if (loginFlowTriggeredRef.current) {
      if (status === 'connecting' || isConnected) close('wallet');
    }
  }, [close, isConnected, isOnWrongNetwork, open, status]);

  // show the deposit modal again when user on right network and logged in
  useEffect(() => {
    if (loginFlowTriggeredRef.current) {
      if (isConnected && !isOnWrongNetwork) {
        open('deposit');
        loginFlowTriggeredRef.current = false;
      }
    }
  }, [isConnected, isOnWrongNetwork, open]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleCtaClicked = useCallback(() => {
    close('deposit');
    navigate(
      generatePath(AllTransfers, {
        network,
        dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
      })
    );
  }, [close, daoDetails?.address, daoDetails?.ensDomain, navigate, network]);

  // close modal and initiate the login/wrong network flow
  const handleConnectClick = useCallback(() => {
    close('deposit');
    loginFlowTriggeredRef.current = true;
  }, [close]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (!daoDetails) return null;

  return (
    <ModalBottomSheetSwitcher
      isOpen={isDepositOpen}
      onClose={() => close('deposit')}
      title={t('modal.deposit.headerTitle')}
      subtitle={t('modal.deposit.headerDescription')}
    >
      <Container>
        <div>
          <Title>{t('modal.deposit.inputLabelBlockchain')}</Title>
          <Subtitle>{t('modal.deposit.inputHelptextBlockchain')}</Subtitle>
          <NetworkDetailsWrapper>
            <HStack>
              <Logo src={CHAIN_METADATA[network].logo} />
              <NetworkName>{CHAIN_METADATA[network].name}</NetworkName>
              {status === 'connected' && !isOnWrongNetwork ? (
                <AlertInline
                  label={t('modal.deposit.statusBlockchain')}
                  mode="success"
                />
              ) : (
                <ConnectButton onClick={handleConnectClick}>
                  {t('modal.deposit.ctaBlockchain')}
                </ConnectButton>
              )}
            </HStack>
          </NetworkDetailsWrapper>
        </div>

        <div>
          <Title>{t('modal.deposit.inputLabelEns')}</Title>
          <Subtitle>{t('modal.deposit.inputHelptextEns')}</Subtitle>
          <WrappedWalletInput
            value={{
              ensName: networkSupportsENS
                ? toDisplayEns(daoDetails.ensDomain)
                : '',
              address: daoDetails.address,
            }}
            onChange={() => {}}
            disabled
          />
        </div>

        <HStack>
          <ButtonText
            mode="primary"
            size="large"
            label={t('modal.deposit.ctaLabel')}
            onClick={handleCtaClicked}
          />
          <ButtonText
            mode="secondary"
            size="large"
            label={t('modal.deposit.cancelLabel')}
            onClick={() => close('deposit')}
          />
        </HStack>
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

const Container = styled.div.attrs({
  className: 'p-3 space-y-3',
})``;

const Title = styled.h2.attrs({
  className: 'ft-text-base font-bold text-ui-800',
})``;

const Subtitle = styled.p.attrs({
  className: 'mt-0.5 text-ui-600 ft-text-sm mb-1.5',
})``;

const NetworkName = styled.p.attrs({
  className: 'flex-1 font-semibold text-ui-800',
})``;

const ConnectButton = styled.button.attrs({
  className: 'font-semibold text-primary-500',
})``;

const NetworkDetailsWrapper = styled.div.attrs({
  className: 'py-1.5 px-2 bg-white rounded-xl',
})``;

const HStack = styled.div.attrs({
  className: 'flex space-x-1.5',
})``;

const Logo = styled.img.attrs({className: 'w-3 h-3 rounded-full'})``;

export default DepositModal;

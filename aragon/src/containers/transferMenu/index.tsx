import {IconChevronRight, ListItemAction} from '@aragon/ods';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {trackEvent} from 'services/analytics';
import {NewWithDraw} from 'utils/paths';

type Action = 'deposit_assets' | 'withdraw_assets';

const TransferMenu: React.FC = () => {
  const {isTransferOpen, close, open} = useGlobalModalContext();
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {dao} = useParams();
  const navigate = useNavigate();

  const handleClick = (action: Action) => {
    trackEvent('newTransfer_modalBtn_clicked', {
      dao_address: dao,
      action,
    });

    if (action === 'deposit_assets') {
      open('deposit');
    } else {
      navigate(generatePath(NewWithDraw, {network: network, dao: dao}));
    }
    close('default');
  };

  return (
    <ModalBottomSheetSwitcher
      isOpen={isTransferOpen}
      onClose={() => close('default')}
      title={t('TransferModal.newTransfer')}
    >
      <Container>
        <ListItemAction
          title={t('modal.deposit.headerTitle')}
          subtitle={t('modal.deposit.headerDescription')}
          iconRight={<IconChevronRight />}
          onClick={() => handleClick('deposit_assets')}
        />
        <ListItemAction
          title={t('TransferModal.item2Title')}
          subtitle={t('TransferModal.item2Subtitle')}
          iconRight={<IconChevronRight />}
          onClick={() => handleClick('withdraw_assets')}
        />
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

export default TransferMenu;

const Container = styled.div.attrs({
  className: 'space-y-1.5 p-3',
})``;

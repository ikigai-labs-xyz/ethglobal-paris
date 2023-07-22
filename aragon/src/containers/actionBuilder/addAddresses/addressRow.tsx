import {
  ButtonIcon,
  Dropdown,
  IconMenuVertical,
  InputValue as WalletInputValue,
} from '@aragon/ods';
import React, {useCallback} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {WrappedWalletInput} from 'components/wrappedWalletInput';
import {useAlertContext} from 'context/alert';
import {useProviders} from 'context/providers';
import {BalanceMember, MultisigMember} from 'hooks/useDaoMembers';
import {Web3Address} from 'utils/library';
import {ActionAddAddress} from 'utils/types';
import {validateWeb3Address} from 'utils/validators';

type Props = {
  actionIndex: number;
  // TODO: when refactoring, this is what indicates whether the row
  // should be editable or not. Please rename.
  isRemove?: boolean;
  fieldIndex: number;
  dropdownItems: Array<{
    callback: (index: number) => void;
    component: React.ReactNode;
  }>;
  onBlur?: () => void;
  onClearRow?: () => void;
  currentDaoMembers?: MultisigMember[] | BalanceMember[];
};

export const AddressRow = ({
  actionIndex,
  isRemove = false,
  fieldIndex,
  dropdownItems,
  onBlur,
  onClearRow,
  currentDaoMembers,
}: Props) => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {infura: provider} = useProviders();

  const {control} = useFormContext();

  const memberWalletsKey = `actions.${actionIndex}.inputs.memberWallets`;
  const memberWallets: ActionAddAddress['inputs']['memberWallets'] = useWatch({
    name: memberWalletsKey,
    control,
  });

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleRowClear = useCallback(() => {
    alert(t('alert.chip.inputCleared'));
    onClearRow?.();
  }, [alert, onClearRow, t]);

  const addressValidator = useCallback(
    async ({address, ensName}: WalletInputValue, index: number) => {
      const web3Address = new Web3Address(provider, address, ensName);

      // check if address is valid
      let validationResult = await validateWeb3Address(
        new Web3Address(provider, address, ensName),
        t('errors.required.walletAddress'),
        t
      );

      // check if there is duplicated address in the Multisig plugin
      if (
        currentDaoMembers?.some(
          member =>
            member.address.toLowerCase() === web3Address.address?.toLowerCase()
        )
      )
        validationResult = t('errors.duplicateAddressOnCurrentMembersList');

      // check if there is a duplicate in the form
      if (
        memberWallets?.some(
          ({address, ensName}, memberWalletIndex) =>
            (address === web3Address.address ||
              ensName === web3Address.ensName) &&
            memberWalletIndex !== index
        )
      )
        validationResult = t('errors.duplicateAddress');

      return validationResult;
    },
    [currentDaoMembers, memberWallets, provider, t]
  );

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <Controller
      name={`${memberWalletsKey}.${fieldIndex}`}
      defaultValue={{address: '', ensName: ''}}
      control={control}
      rules={{validate: value => addressValidator(value, fieldIndex)}}
      render={({field: {onChange, ref, value}, fieldState: {error}}) => (
        <Container>
          <InputContainer>
            <WrappedWalletInput
              state={error && 'critical'}
              disabled={isRemove}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
              error={error?.message}
              resolveLabels="onBlur"
              ref={ref}
              onClearButtonClick={handleRowClear}
            />
          </InputContainer>
          <Dropdown
            disabled={memberWallets?.length === 1 && !isRemove}
            side="bottom"
            align="start"
            sideOffset={4}
            listItems={dropdownItems.map(item => ({
              component: item.component,
              callback: () => item.callback(fieldIndex),
            }))}
            trigger={
              <ButtonIcon
                size="large"
                mode="secondary"
                icon={<IconMenuVertical />}
                data-testid="trigger"
                bgWhite
              />
            }
          />
        </Container>
      )}
    />
  );
};

const Container = styled.div.attrs(() => ({
  className: 'flex gap-2 items-start',
}))``;

const InputContainer = styled.div.attrs(() => ({
  className: 'flex flex-col gap-1 flex-1',
}))``;

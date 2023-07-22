import {useProviders} from 'context/providers';
import {useEffect, useState, useMemo} from 'react';
import {getDaoTokenOwner} from 'utils/tokens';
import {useDaoDetailsQuery} from './useDaoDetails';
import {useDaoToken} from './useDaoToken';
import {
  DaoDetails,
  Erc20TokenDetails,
  Erc20WrapperTokenDetails,
} from '@aragon/sdk-client';
import {validateGovernanceTokenAddress} from 'utils/validators';

export const useExistingToken = ({
  daoDetails,
  daoToken,
}: {
  daoDetails?: DaoDetails | null | undefined;
  daoToken?: Erc20TokenDetails | Erc20WrapperTokenDetails | undefined;
} = {}) => {
  const {infura: provider} = useProviders();
  const {data: daoDetailsFetched} = useDaoDetailsQuery();

  const dao = useMemo(
    () => daoDetails || daoDetailsFetched,
    [daoDetails, daoDetailsFetched]
  );

  const {data: daoTokenFetched} = useDaoToken(
    dao?.plugins?.[0]?.instanceAddress || ''
  );

  const token = useMemo(
    () => daoToken || daoTokenFetched,
    [daoToken, daoTokenFetched]
  );

  const [isDAOTokenWrapped, setIsDAOTokenWrapped] = useState(false);
  const [isTokenMintable, setIsTokenMintable] = useState(false);

  useEffect(() => {
    async function fetchTokenOwner() {
      if (!dao || !token) return;
      const tokenDaoOwner = await getDaoTokenOwner(token.address, provider);

      setIsTokenMintable(tokenDaoOwner?.toLocaleLowerCase() === dao.address);
    }

    fetchTokenOwner();
  }, [dao, provider, token]);

  useEffect(() => {
    async function detectWhetherGovTokenIsWrapped(
      token: Erc20WrapperTokenDetails | undefined
    ) {
      if (!token) return;

      let tokenType = '';
      const isUnderlyingTokenExists = !!token.underlyingToken;

      if (isUnderlyingTokenExists) {
        const {type} = await validateGovernanceTokenAddress(
          token.underlyingToken.address,
          provider
        );

        tokenType = type;
      }

      setIsDAOTokenWrapped(
        tokenType !== 'governance-ERC20' && isUnderlyingTokenExists
      );
    }

    detectWhetherGovTokenIsWrapped(
      token as Erc20WrapperTokenDetails | undefined
    );
  }, [provider, token]);

  return {
    isTokenMintable,
    isDAOTokenWrapped,
  };
};

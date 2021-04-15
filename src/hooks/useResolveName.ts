import { useState, useEffect } from 'react'
import { AddressZero } from '@ethersproject/constants'
import { useActiveWeb3React } from './index'


const useResolveName = (ensName: string | Promise<string>) => {
  const { library: provider } = useActiveWeb3React()
  const [address, setAddress] = useState(AddressZero);

  useEffect(() => {
    if (provider) {
      provider.resolveName(ensName).then((resolvedAddress) => setAddress(resolvedAddress));
    }
  }, [provider, ensName]);

  return address;
};

export default useResolveName;

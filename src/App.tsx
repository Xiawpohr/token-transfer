import React from 'react';
import { SnackbarProvider } from 'notistack'
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import Container from '@material-ui/core/Container'
import ThemeProvider from './theme'
import Web3Manager from './components/Web3Manager'
import Header from './components/Header'
import SendForm from './components/SendForm'
import { NetworkContextName } from './constants'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any')
  library.pollingInterval = 15000
  return library
}


function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <ThemeProvider>
          <SnackbarProvider
            maxSnack={5}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Web3Manager>
              <div>
                <Header />
                <Container maxWidth='sm' style={{ paddingTop: '24px' }}>
                  <SendForm />
                </Container>
              </div>
            </Web3Manager>
          </SnackbarProvider>
        </ThemeProvider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  );
}

export default App;

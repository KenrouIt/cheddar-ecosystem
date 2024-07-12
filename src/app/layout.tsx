'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import '@near-wallet-selector/modal-ui/styles.css';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletSelectorContextProvider } from '@/contexts/WalletSelectorContext';
import { GameContextProvider } from '@/contexts/maze/GameContextProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Navbar from '@/components/Navbar/containers/Navbar';

const inter = Inter({ subsets: ['latin'] });

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + ' backgroundImg'}>
        <WalletSelectorContextProvider>
          <ChakraProvider>
            <QueryClientProvider client={queryClient}>
              <>
                <Navbar />
                {children}
              </>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </ChakraProvider>
        </WalletSelectorContextProvider>
      </body>
    </html>
  );
}

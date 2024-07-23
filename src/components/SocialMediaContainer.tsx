import { Box, Link } from '@chakra-ui/react';
import styles from '../styles/SocialMedia.module.css';
import { Chatter, Discord, GitBook, Telegram, Twitter } from './icons';

export const SocialMedia = () => {
  return (
    <Box className={styles.container}>
      <Box className={styles.secondContainer}>
        <Link
          display="flex"
          href="https://t.me/cheddarfarm"
          target="_blank"
          _hover={{ bg: 'yellowCheddar' }}
          _active={{ textDecoration: 'none', boxShadow: '0 0 0 0 #0000' }}
          _focus={{ textDecoration: 'none', boxShadow: '0 0 0 0 #0000' }}
        >
          <Telegram boxSize={6} color={'#8542eb'} />
        </Link>

        <Link
          display="flex"
          href="https://discord.com/invite/G9PTbmPUwe"
          target="_blank"
          _hover={{ bg: 'yellowCheddar' }}
          _active={{ textDecoration: 'none', boxShadow: '0 0 0 0 #0000' }}
          _focus={{ textDecoration: 'none', boxShadow: '0 0 0 0 #0000' }}
        >
          <Discord boxSize={6} color={'#8542eb'} />
        </Link>

        <Link
          display="flex"
          href="https://twitter.com/CheddarFi"
          target="_blank"
          _hover={{ bg: 'yellowCheddar' }}
          _active={{ textDecoration: 'none', boxShadow: '0 0 0 0 #0000' }}
          _focus={{ textDecoration: 'none', boxShadow: '0 0 0 0 #0000' }}
        >
          <Twitter boxSize={5} color={'#8542eb'} />
        </Link>

        <Link
          display="flex"
          href="https://cheddarfarm.gitbook.io/docs"
          target="_blank"
          _hover={{ bg: 'yellowCheddar' }}
          _active={{ textDecoration: 'none', boxShadow: '0 0 0 0 #0000' }}
          _focus={{ textDecoration: 'none', boxShadow: '0 0 0 0 #0000' }}
        >
          <GitBook boxSize={7} color={'#8542eb'} />
        </Link>

        <Link
          display="flex"
          href="https://near.social/chatter.cheddar.near/widget/home"
          target="_blank"
          _hover={{ bg: 'yellowCheddar' }}
          _active={{ textDecoration: 'none', boxShadow: '0 0 0 0 #0000' }}
          _focus={{ textDecoration: 'none', boxShadow: '0 0 0 0 #0000' }}
        >
          <Chatter boxSize={6} color={'#8542eb'} />
        </Link>
      </Box>
    </Box>
  );
};

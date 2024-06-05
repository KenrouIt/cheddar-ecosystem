import { Image, Text } from '@chakra-ui/react';
import { ModalContainer } from './FeedbackModal';
import { useEffect, useState } from 'react';

export default function ModalWelcome() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const welcomeModalWasShown = localStorage.getItem('welcomeModalWasShown');
    if (welcomeModalWasShown === null) {
      localStorage.setItem('welcomeModalWasShown', 'true');
      setShowWelcomeModal(true);
    }
  }, []);

  return (
    <ModalContainer
      isOpen={showWelcomeModal}
      onClose={() => setShowWelcomeModal(false)}
      title=""
      hideButtons
      bgColor="#8542eb"
      border="10px solid white"
      color={'white'}
      fontSize="16px"
      fontWeight="600"
    >
      <Image
        src="assets/cheddar-logo.png"
        alt="cheddar logo with text"
        mb="30px"
      />
      <Text>
        More the a loyalty token, it&apos;s a freedom movement. We empower
        communities to farm, connect, and, grow, through a fun web3 experience.
        Cheddar brings good vibes and breaks down barriers
      </Text>
      <Text>- join the movement!</Text>
    </ModalContainer>
  );
}
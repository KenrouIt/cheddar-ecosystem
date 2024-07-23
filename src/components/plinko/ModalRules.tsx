import { getConfig } from '@/configs/config';
import { ModalContainer } from '../ModalContainer';
import { ListItem, OrderedList, UnorderedList } from '@chakra-ui/react';
import Link from 'next/link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalRules({ isOpen, onClose }: Props) {
  return (
    <ModalContainer title={'Rules'} isOpen={isOpen} onClose={onClose}>
      <OrderedList>
        <ListItem>Click the position you want to drop the ball in.</ListItem>
        <ListItem>
          If a ball get's stuck use the "Hit machine" button until the ball
          get's unstucked.
        </ListItem>
        <ListItem>You'll get CHEDDAR acording to the goal you get to.</ListItem>
        <ListItem>
          SPLAT = 0, NANO = 5, MICRO = 10, MEGA: 25, GIGA = 55
        </ListItem>
        <ListItem>
          The game end's when every ball is on the bottom. You can keep
          exploring the maze then.
        </ListItem>
      </OrderedList>
    </ModalContainer>
  );
}

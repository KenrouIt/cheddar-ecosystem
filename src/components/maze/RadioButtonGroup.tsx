import { Box, HStack, useRadio, useRadioGroup } from '@chakra-ui/react';
import { isCurrentBrowserSupported } from '@near-wallet-selector/core';
import styles from '@/styles/RadioButtonGroup.module.css';

export const RadioCard = (props: any) => {
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRadioProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        className={styles.innerBox}
        px={5}
        py={3}
        {...checkbox}
        background={props.optionSelected === props.children ? '#ECC94B' : ''}
        _checked={{
          bg: 'teal.600',
          color: 'white',
          borderColor: 'teal.600',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};

export const RadioButtonBroup = (props: any) => {
  const { options, optionSelected, setOptionSelected } = props;
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'framework',
    defaultValue: 'react',
  });

  const group = getRootProps();

  return (
    <HStack {...group}>
      {options.map((option: any) => {
        const { name } = option;
        const radio = getRadioProps({ name });
        function onChange() {
          setOptionSelected(name);
        }

        return (
          <RadioCard
            key={name}
            {...radio}
            optionSelected={optionSelected}
            onChange={onChange}
          >
            {name}
          </RadioCard>
        );
      })}
    </HStack>
  );
};

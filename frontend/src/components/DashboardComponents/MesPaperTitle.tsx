import React from 'react';
import { Stack, Text } from '@fluentui/react';

import MesLabelAndIconButton from './MesLabelAndIconButton';
import { AddRegular } from '@fluentui/react-icons';

interface ButtonProps {
  Icon: React.FC<any>;
  Label: string;
  OnClickHandler: () => void;
}

interface MesPaperTitleProps {
  Icon?: React.FC<any>;
  needButtons?: boolean;
  buttonList?: ButtonProps[];
  headingLabel?: string;
  customTitleColor?: string;
  iconClassName?: string;
  headingLabelClassName?: string;
  CustomComponent?: React.ReactNode;
}

const MesPaperTitle: React.FC<MesPaperTitleProps> = ({
  Icon = AddRegular,
  needButtons = true,
  buttonList = [
    {
      Icon: () => null,
      Label: 'Click Here',
      OnClickHandler: () => {
        alert('Action Click');
      },
    },
  ],
  headingLabel = 'Heading Label',
  customTitleColor = 'var(--color-primary)',
  iconClassName = 'slidingFormComponentTitle',
  headingLabelClassName = '',
  CustomComponent = null,
}) => {
  return (
    <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: 16 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
        {Icon && <Icon className={iconClassName} />}
        <Text variant="large" className={headingLabelClassName} style={{ color: customTitleColor }}>
          {headingLabel}
        </Text>
      </Stack>

      {needButtons ? (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          {buttonList.map((b, i) => (
            <MesLabelAndIconButton
              key={i}
              Icon={b.Icon}
              Label={b.Label}
              OnClickHandler={b.OnClickHandler}
            />
          ))}
        </Stack>
      ) : (
        CustomComponent ?? null
      )}
    </Stack>
  );
};

export default MesPaperTitle;

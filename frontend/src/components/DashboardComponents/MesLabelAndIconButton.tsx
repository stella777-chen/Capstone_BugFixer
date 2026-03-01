import React from 'react';
import { Button } from '@fluentui/react-components';
import "../../assets/styles/inputForm.css"
import { Stack, Text } from '@fluentui/react';
import { Add16Regular } from '@fluentui/react-icons';
interface MesLabelAndIconButtonProps {
  Label?: string;
  classNameButton?: string;
  classNameText?: string;
  classNameTextWithStartICon?: string;
  classNameTextWithEndICon?: string;
  classNameStartIcon?: string;
  classNameEndIcon?: string;
  OnClickHandler?: () => void;
  Icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  endIconButton?: React.FC<React.SVGProps<SVGSVGElement>>;
  hasIconButton?: boolean;
  isStartIcon?: boolean;
  ButtonType?: 'button' | 'submit' | 'reset';
  classNameButtonDiv?: string;
  isShown?: boolean;
  isButtonCapsOff?: boolean;
}

const checkDefaultButtonClick = () => {
  alert('Text Button clicked');
};

const MesLabelAndIconButton: React.FC<MesLabelAndIconButtonProps> = ({
  Label = 'Test Button',
  classNameButton = 'customized-icon-button',
  classNameText = 'cantier-text-button-label',
  classNameTextWithStartICon = 'cantier-text-button-label-with-start-icon',
  classNameTextWithEndICon = 'cantier-text-button-label-with-end-icon',
  classNameStartIcon = 'custom-button-start-icon',
  classNameEndIcon = 'custom-button-end-icon',
  OnClickHandler = checkDefaultButtonClick,
  Icon = Add16Regular,
  hasIconButton = true,
  isStartIcon = true,
  ButtonType = 'button',
  classNameButtonDiv = 'custom-label-and-icon-button-grid',
  isShown = true,
  isButtonCapsOff = false,
}) => {
  if (!isShown) return null;

  const renderStartIconButton = () => (
    <Button
      type={ButtonType}
      onClick={ButtonType === 'submit' ? () => {} : OnClickHandler}
      className={classNameButton}
      appearance="transparent"
    >
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
        <Icon className={classNameStartIcon} />
        <Text className={classNameTextWithStartICon} style={{ textTransform: isButtonCapsOff ? 'none' : undefined }}>
          {Label}
        </Text>
      </Stack>
    </Button>
  );

  const renderEndIconButton = () => (
    <Button
      type={ButtonType}
      onClick={ButtonType === 'submit' ? () => {} : OnClickHandler}
      className={classNameButton}
      appearance="transparent"
    >
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
        <Text className={classNameTextWithEndICon} style={{ textTransform: isButtonCapsOff ? 'none' : undefined }}>
          {Label}
        </Text>
        {/* <endIconButton className={classNameEndIcon} /> */}
      </Stack>
    </Button>
  );

  const renderTextOnlyButton = () => (
    <Button
      type={ButtonType}
      onClick={ButtonType === 'submit' ? () => {} : OnClickHandler}
      className={classNameButton}
      appearance="transparent"
    >
      <Text className={classNameText} style={{ textTransform: isButtonCapsOff ? 'none' : undefined }}>
        {Label}
      </Text>
    </Button>
  );

  return (
    <div className={classNameButtonDiv}>
      {hasIconButton ? (isStartIcon ? renderStartIconButton() : renderEndIconButton()) : renderTextOnlyButton()}
    </div>
  );
};

export default MesLabelAndIconButton;

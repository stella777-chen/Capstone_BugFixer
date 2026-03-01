import React, { FC, ReactNode, CSSProperties } from "react";
import { Text } from "@fluentui/react-components";
import { PersonAddRegular, DismissRegular } from "@fluentui/react-icons";
import "./CantierSliderForm.scss";
import CantierSpinner from "../CantierSpinner/CantierSpinner";

interface ISlider {
  open: boolean;
  loading?: boolean;
  title?: string;
  icon?: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  modalBody?: ReactNode;
  sliderActions?: ReactNode | null;
  width?: string; 
  size?: "sm" | "md" | "lg"; 
  style?: CSSProperties;
}

const CantierSliderForm: FC<ISlider> = ({
  onClose,
  open,
  children,
  modalBody,
  sliderActions,
  icon,
  title = "Add New Task",
  width,
  size = "sm",
  style = {},
  loading = false,
}) => {
	const panelStyle: CSSProperties = {
		width,
		...style,
	};

	const visibilityClass = open ? "visible" : "hidden";

	const buttonContainerStyle: CSSProperties = {
		width,
	};

	return (
		<div
			className={`sidePanel ${visibilityClass} ${size}`}
			// style={panelStyle}
			>
			<div className="sidePanel_header">
				<div className="sidePanel_title">
					{icon ? (
						icon
					) : (
						<PersonAddRegular className="defaultIcon" />
					)}
					<Text className="titleText">
						{title}
					</Text>
				</div>
				<DismissRegular
					className="closeButtonIcon"
					onClick={onClose}
				/>
			</div>
			  {/* Loader overlay */}
      {loading ? (
        <div className="formContent flex-center">
          <CantierSpinner className={"spin_overlay_slider"}/>
        </div>
      ) : children ? (
        <div className="formContent">{children}</div>
      ) : modalBody ? (
        <div className="formContent">{modalBody}</div>
      ) : null}

      {sliderActions ? (
        <div className="form-button-group">{sliderActions}</div>
      ) : null}
    </div>
  );
};

export default CantierSliderForm;

import { Caption1, Card, CardHeader, Text } from '@fluentui/react-components';
import React from 'react';
import "./CantierSecondaryCard.scss";
export interface CardBaseProps {
    icon?: React.ReactNode;
    title: string;
    subtitle: string;
    value: string | number;
    colorCode: string;
    className?: string;
}
const CantierSecondaryCard: React.FC<CardBaseProps> = ({
    icon,
    title,
    subtitle,
    value,
    colorCode = "red",
    // backgroundColor: color,
    className,
}) => {
    const backgroundColor = {
        red: "#a61a31",
        blue: "#3062c5",
        green: "#3c8646",
        orange: "#ff8f00",
    };
    return (
        <>
            <Card
                className={`CantierSecondaryCard ${className}`}
                style={{ '--cardColor': backgroundColor[colorCode as keyof typeof backgroundColor] } as React.CSSProperties}
            >
                <CardHeader
                    image={
                        icon ? (
                            <div className="card_icon">
                                {icon}
                            </div>
                        ) : null
                    }
                    header={
                        <Text className="card_header_text" title={title}>
                            {title}
                        </Text>
                    }
                    description={
                        <Caption1 className="card_caption" title={subtitle}>
                            {subtitle}
                        </Caption1>
                    }
                />
                <p className="card_value">{value}</p>
            </Card>
        </>
    )
}

export default CantierSecondaryCard

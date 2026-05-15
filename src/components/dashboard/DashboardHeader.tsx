import React from "react";
import Button from "@/components/dashboard/Button";

type DashboardHeaderProps = {
    title: string;
    subTitle?: string;
    button?: {
        text: string;
        onClick?: () => void;
    };
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    title,
    subTitle,
    button,
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl">{title}</h1>
                {subTitle && (
                    <p className="text-muted mt-1">{subTitle}</p>
                )}
            </div>

            {button && (
                <Button
                    text={button.text}
                    onClick={button.onClick}
                />
            )}
        </div>
    );
};

export default DashboardHeader;
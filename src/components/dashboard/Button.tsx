import React from "react";
import { HiOutlinePlus } from "react-icons/hi";

type ButtonProps = {
    text: string;
    onClick?: () => void;
    icon?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ text, onClick, icon }) => {
    return (
        <button className="btn btn-primary" onClick={onClick}>
            {icon ?? <HiOutlinePlus className="w-4 h-4" />}
            <span>{text}</span>
        </button>
    );
};

export default Button;
import React from 'react'


interface InputFieldProps {
    label: string;
    icon: React.ElementType;
    error?: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    rightElement?: React.ReactNode;
}


const InputField = ({ label, icon: Icon, error, type = 'text', placeholder, value, onChange, rightElement }: InputFieldProps) => (
    <div>
        <label className="block text-white/80 text-sm font-medium mb-2">{label}</label>
        <div className={`relative transition-all duration-300 rounded-xl ${error ? 'ring-2 ring-red-500/50' : 'focus-within:ring-2 focus-within:ring-emerald-500/50'}`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                <Icon className="w-5 h-5" />
            </div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder-white/40 focus:outline-none"
            />
            {rightElement && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>
            )}
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
);


export default InputField

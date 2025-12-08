import { useState, useRef, useEffect } from 'react';

interface FontOption {
    value: string;
    label: string;
    fontFamily: string;
}

interface FontSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: FontOption[];
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
}

export function FontSelect({
    value,
    onChange,
    options,
    placeholder = "Default",
    className,
    style
}: FontSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (newValue: string) => {
        onChange(newValue);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`cursor-pointer bg-white flex items-center justify-between ${className}`}
                style={style}
            >
                <span
                    className={!selectedOption ? 'text-gray-500' : 'text-gray-900'}
                    style={{ fontFamily: selectedOption?.fontFamily }}
                >
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-500"
                        onClick={() => handleSelect("")}
                    >
                        {placeholder}
                    </div>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${value === option.value ? 'bg-orange-50 text-[#F34A23]' : 'text-gray-900'
                                }`}
                            style={{ fontFamily: option.fontFamily }}
                        >
                            <span>{option.label}</span>
                            {value === option.value && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

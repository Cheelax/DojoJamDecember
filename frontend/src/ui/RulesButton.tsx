import React from 'react';

interface RulesButtonProps {
  onClick: () => void;
  disabled?: boolean; // Optional disabled prop
}

const RulesButton: React.FC<RulesButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      className={`bg-[#ffdb9e] transition ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#ffd285]'
      } my-10 text-white font-bold py-2 px-4 rounded w-full max-w-xs`}
      onClick={onClick}
      disabled={disabled}
    >
      Rules
    </button>
  );
};

export default RulesButton;

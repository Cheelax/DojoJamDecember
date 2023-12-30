import React from 'react';

interface FaucetButtonProps {
  onClick: () => void;
  disabled?: boolean; // Optional disabled prop
}

const FaucetButton: React.FC<FaucetButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      className={`bg-[#ffdb9e] transition ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#ffd285]'
      } my-10 text-white font-bold py-2 px-4 rounded w-full max-w-xs`}
      onClick={onClick}
      disabled={disabled}
    >
      Faucet
    </button>
  );
};

export default FaucetButton;

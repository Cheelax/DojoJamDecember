import { FC } from 'react';
import { GiSharpAxe, GiBoots, GiCrownedHeart } from 'react-icons/gi';

interface StatsCardProps {
  data: any;
  isSelected?: boolean;
  onClick?: () => void;
}

const StatsCard: FC<StatsCardProps> = ({ data, isSelected = undefined, onClick }) => {
  const statsClasses = {
    strength: { borderColor: 'border-[#db9346]', icon: <GiSharpAxe className="text-[#db9346] w-[100px] h-[100px]" /> },
    dexterity: {
      borderColor: 'border-[#d6625e]',
      icon: <GiBoots className="text-[#d6625e] text-4xl w-[100px] h-[100px]" />,
    },
    vitality: {
      borderColor: 'border-[#b2d3b1]',
      icon: <GiCrownedHeart className="text-[#b2d3b1] text-4xl w-[100px] h-[100px]" />,
    },
  };

  const highestStat = () => {
    if (!data || !data.value) {
      return 'null';
    }

    let highestStat = data.value.reduce((max, stat) => {
      return (max.value || 0) < stat.value ? stat : max;
    }, {});

    return highestStat.name;
  };

  const statColor = (statName: string) => {
    if (highestStat() === 'strength' && statName === 'strength') {
      return 'text-[#db9346]';
    }
    if (highestStat() === 'dexterity' && statName === 'dexterity') {
      return 'text-[#d6625e]';
    }
    if (highestStat() === 'vitality' && statName === 'vitality') {
      return 'text-[#b2d3b1]';
    }
  };

  return (
    <div
      className={`flex flex-col w-[200px] px-6 py-4 min-h-[300px] justify-between items-center border-4 rounded-xl cursor-pointer ${
        isSelected === undefined || true ? statsClasses[highestStat()].borderColor : ''
      } ${isSelected === false ? 'grayscale' : ''}`}
      onClick={onClick}
    >
      <p className="text-gray-600">{data.name}</p>
      <div className="text-4xl">{statsClasses[highestStat()].icon}</div>
      <div className="w-full flex flex-col gap-2 text-xs">
        {data.value.map((stat: any) => {
          return (
            <div key={stat.name} className={`flex justify-between w-full ${statColor(stat.name)}`}>
              <p className="">{stat.name}</p>
              <p className="">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCard;

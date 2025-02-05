import React, { ReactNode, useState } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  trigger = 'hover',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseEnter = () => {
    if (trigger === 'hover') setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') setIsVisible(false);
  };

  const handleClick = () => {
    if (trigger === 'click') setIsVisible(!isVisible);
  };

  let positionClasses = 'bottom-full mb-2';
  if (position === 'top') positionClasses = 'top-full mt-2';
  if (position === 'left') positionClasses = 'left-full ml-2';
  if (position === 'right') positionClasses = 'right-full mr-2';

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      {isVisible && (
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 ${positionClasses} p-2 bg-gray-700 text-white text-sm rounded-md z-10`}
          style={{ width: '200px' }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;

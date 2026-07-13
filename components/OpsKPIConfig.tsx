import React from 'react';
import { IndicatorsPage } from '../pages/Indicators';

export const OpsKPIConfig: React.FC<{ department: string }> = ({ department }) => {
  return (
    <div className="animate-in fade-in duration-300">
       <IndicatorsPage departmentFilter={department} />
    </div>
  );
};

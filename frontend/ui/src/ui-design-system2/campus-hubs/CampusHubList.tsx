'use client';

import React from 'react';

export interface CampusHubItem {
  id: string;
  name: string;
  location: string;
  hours: string;
  status: 'ONLINE // OPEN' | '24/7 AUTOMATED' | 'STAFFED';
  lockersAvailable: number;
}

export const DEFAULT_CAMPUS_HUBS: CampusHubItem[] = [
  {
    id: 'palo-alto',
    name: 'PALO ALTO CENTRAL LOCKER HUB',
    location: '412 UNIVERSITY AVE • NEAR STANFORD CAMPUS',
    hours: '24/7 TOUCHLESS PICKUP',
    status: '24/7 AUTOMATED',
    lockersAvailable: 42,
  },
  {
    id: 'berkeley',
    name: 'UC BERKELEY TELEGRAPH DEPOT',
    location: '2430 TELEGRAPH AVE • SATELLITE PICKUP BAY',
    hours: 'DAILY 08:00 - 22:00',
    status: 'ONLINE // OPEN',
    lockersAvailable: 18,
  },
  {
    id: 'cambridge',
    name: 'CAMBRIDGE KENDALL SQUARE HUB',
    location: '290 MAIN ST • MIT CAMPUS COMMONS',
    hours: '24/7 AUTOMATED LOCKERS',
    status: '24/7 AUTOMATED',
    lockersAvailable: 29,
  },
];

export interface CampusHubListProps {
  hubs?: CampusHubItem[];
  selectedHubId?: string;
  onSelectHub?: (id: string) => void;
  className?: string;
}

export const CampusHubList: React.FC<CampusHubListProps> = ({
  hubs = DEFAULT_CAMPUS_HUBS,
  selectedHubId,
  onSelectHub,
  className = '',
}) => {
  return (
    <div
      data-testid="campus-hub-list"
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 font-mono ${className}`}
    >
      {hubs.map((hub) => {
        const isSelected = selectedHubId === hub.id;
        return (
          <div
            key={hub.id}
            onClick={() => onSelectHub?.(hub.id)}
            className={`p-4 border border-[#181816] transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#F6F4EC] shadow-[inset_0_0_0_1.5px_#181816]'
                : 'bg-[#EAE7DF] hover:bg-[#F3F0E8] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#181816]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#181816]/15">
              <span className="text-[10px] uppercase font-bold text-[#141413]/70">
                CAMPUS LOCKER BAY
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#141413] text-[#C9F24B] font-bold">
                {hub.status}
              </span>
            </div>

            <h4 className="font-bold text-xs uppercase text-[#141413] tracking-tight mb-1">
              {hub.name}
            </h4>
            <p className="text-[10px] text-[#141413]/65 uppercase mb-3">{hub.location}</p>

            <div className="flex items-center justify-between text-[10px] pt-2 border-t border-dashed border-[#181816]/20">
              <span className="text-[#141413]/60">{hub.hours}</span>
              <span className="font-bold text-emerald-800">
                {hub.lockersAvailable} LOCKERS READY
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RewardRatesPanel, type SaveRewardRate } from './RewardRatesPanel';

const history = [
  {
    id: 2,
    pointsPerEgp: '2.000000',
    egpPerPoint: '0.0200',
    createdAt: '2026-10-04T08:00:00.000Z',
  },
  {
    id: 1,
    pointsPerEgp: '1.250000',
    egpPerPoint: '0.0125',
    createdAt: '2026-10-03T08:00:00.000Z',
  },
];

const save: SaveRewardRate = async () => ({ status: 'saved' });

describe('RewardRatesPanel', () => {
  it('shows the current rate and append-only history to a viewer', () => {
    render(
      <RewardRatesPanel current={history[0]} history={history} canManage={false} save={save} />,
    );

    expect(screen.getByText('Current Reward Rate')).toBeInTheDocument();
    expect(screen.getAllByText('2.000000')).not.toHaveLength(0);
    expect(screen.getByText('1.250000')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Set Reward Rate' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Partner Points per EGP')).not.toBeInTheDocument();
  });

  it('shows the append action only with rate-management permission', () => {
    render(<RewardRatesPanel current={null} history={[]} canManage save={save} />);

    expect(screen.getByLabelText('Partner Points per EGP')).toBeInTheDocument();
    expect(screen.getByLabelText('EGP per Partner Point')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set Reward Rate' })).toBeInTheDocument();
  });
});

import * as migration_20261003_022453_initial from './20261003_022453_initial';
import * as migration_20261003_071824_order_next_steps from './20261003_071824_order_next_steps';

export const migrations = [
  {
    up: migration_20261003_022453_initial.up,
    down: migration_20261003_022453_initial.down,
    name: '20261003_022453_initial',
  },
  {
    up: migration_20261003_071824_order_next_steps.up,
    down: migration_20261003_071824_order_next_steps.down,
    name: '20261003_071824_order_next_steps'
  },
];

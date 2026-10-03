import * as migration_20261003_022453_initial from './20261003_022453_initial';
import * as migration_20261003_071824_order_next_steps from './20261003_071824_order_next_steps';
import * as migration_20261003_071825_analytics_settings from './20261003_071825_analytics_settings';

export const migrations = [
  {
    up: migration_20261003_022453_initial.up,
    down: migration_20261003_022453_initial.down,
    name: '20261003_022453_initial',
  },
  {
    up: migration_20261003_071824_order_next_steps.up,
    down: migration_20261003_071824_order_next_steps.down,
    name: '20261003_071824_order_next_steps',
  },
  {
    up: migration_20261003_071825_analytics_settings.up,
    down: migration_20261003_071825_analytics_settings.down,
    name: '20261003_071825_analytics_settings'
  },
];

import * as migration_20261003_022453_initial from './20261003_022453_initial';
import * as migration_20261003_071824_order_next_steps from './20261003_071824_order_next_steps';
import * as migration_20261003_071825_analytics_settings from './20261003_071825_analytics_settings';
import * as migration_20261003_073103_scheduled_publishing from './20261003_073103_scheduled_publishing';
import * as migration_20261013_064024_stock_holds from './20261013_064024_stock_holds';
import * as migration_20261013_065314_drop_footer_payment_labels from './20261013_065314_drop_footer_payment_labels';
import * as migration_20261013_065821_stock_flags_for_listings from './20261013_065821_stock_flags_for_listings';
import * as migration_20261013_234544_order_number_mark from './20261013_234544_order_number_mark';

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
    name: '20261003_071825_analytics_settings',
  },
  {
    up: migration_20261003_073103_scheduled_publishing.up,
    down: migration_20261003_073103_scheduled_publishing.down,
    name: '20261003_073103_scheduled_publishing',
  },
  {
    up: migration_20261013_064024_stock_holds.up,
    down: migration_20261013_064024_stock_holds.down,
    name: '20261013_064024_stock_holds',
  },
  {
    up: migration_20261013_065314_drop_footer_payment_labels.up,
    down: migration_20261013_065314_drop_footer_payment_labels.down,
    name: '20261013_065314_drop_footer_payment_labels',
  },
  {
    up: migration_20261013_065821_stock_flags_for_listings.up,
    down: migration_20261013_065821_stock_flags_for_listings.down,
    name: '20261013_065821_stock_flags_for_listings',
  },
  {
    up: migration_20261013_234544_order_number_mark.up,
    down: migration_20261013_234544_order_number_mark.down,
    name: '20261013_234544_order_number_mark'
  },
];

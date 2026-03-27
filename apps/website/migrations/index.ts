import * as migration_20260326_142357 from './20260326_142357';
import * as migration_20260327_123528 from './20260327_123528';
import * as migration_20260327_135230 from './20260327_135230';

export const migrations = [
  {
    up: migration_20260326_142357.up,
    down: migration_20260326_142357.down,
    name: '20260326_142357',
  },
  {
    up: migration_20260327_123528.up,
    down: migration_20260327_123528.down,
    name: '20260327_123528',
  },
  {
    up: migration_20260327_135230.up,
    down: migration_20260327_135230.down,
    name: '20260327_135230'
  },
];

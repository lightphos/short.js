import { sh } from './short-api.js';

import { app } from './app/app.js';

sh.fix(app());

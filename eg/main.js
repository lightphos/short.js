import { sh } from '../short-api.js';

import { app } from './pg/app.js';

sh.fix(app());

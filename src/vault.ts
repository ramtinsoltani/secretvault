#!/usr/bin/env node
import app from 'argumental';
import path from 'path';

import './common';
import './commands/new';
import './commands/list';
import './commands/write';
import './commands/read';
import './commands/delete';
import './commands/remove';
import './commands/clone';
import './commands/update';
import './commands/generate';
import './commands/export';
import './commands/import';

app
.version(require(path.resolve(__dirname, '..', 'package.json')).version)
.parse(process.argv);

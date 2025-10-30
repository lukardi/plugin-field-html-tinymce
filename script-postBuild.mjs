import * as path from 'node:path';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = promisify(exec);

(async () => {
    const DIR_LIB_SRC = path.join(__dirname, 'src/client/lib');
    const DIR_LIB_DEST = path.join(__dirname, 'dist/client/lib');

    console.log(`✏️ copy "lib" directory`);

    await execPromise(`cp -r ${DIR_LIB_SRC} ${DIR_LIB_DEST}`);
})();
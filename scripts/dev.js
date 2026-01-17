import { execSync, spawn } from 'child_process';

const PORT = 3000;

try {
  // Check if port is in use
  // lsof -t returns PIDs, one per line. We replace newlines with spaces for the kill command.
  const output = execSync(`lsof -t -i:${PORT}`).toString().trim();
  const pids = output.replace(/\n/g, ' ');
  
  if (pids) {
    console.log(`Killing process(es) ${pids} on port ${PORT}...`);
    execSync(`kill -9 ${pids}`);
    console.log('Process(es) killed.');
  }
} catch (error) {
  // Ignore error if no process is found (lsof returns non-zero exit code)
}

console.log('Starting Next.js dev server...');
const child = spawn('next', ['dev'], { stdio: 'inherit', shell: true });

child.on('close', (code) => {
  process.exit(code);
});

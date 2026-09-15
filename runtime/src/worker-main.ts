import { startWorker } from './worker.js';

try {
  const worker = await startWorker(process.env);
  console.log(
    JSON.stringify({
      event: 'started',
      process: 'worker',
      revision: worker.revision,
      delivery: 'configured',
    }),
  );
  let closing = false;
  const stop = () => {
    if (closing) return;
    closing = true;
    void worker.close().catch(() => {
      process.exitCode = 1;
    });
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
} catch (error) {
  const message =
    error instanceof Error && error.message.startsWith('Invalid configuration:')
      ? error.message
      : 'Worker startup failed';
  console.error(JSON.stringify({ event: 'startup-failed', process: 'worker', message }));
  process.exitCode = 1;
}

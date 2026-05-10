import { spawn } from 'child_process';

const child = spawn('pnpm', ['--filter', '@findeg/db', 'db:push'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
});

let attributesAnswered = false;
let isDefaultAnswered = false;
let sortOrderAnswered = false;
let mediaSetAnswered = false;
let truncateAnswered = false;
let applyAnswered = false;

child.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);

  if (!attributesAnswered && output.includes('Is catalog.attributes table created or renamed from another table?')) {
    console.log('--- Answering attributes rename ---');
    // We want to rename from attribute_definitions (option 4)
    child.stdin.write('\x1B[B');
    setTimeout(() => child.stdin.write('\x1B[B'), 200);
    setTimeout(() => child.stdin.write('\x1B[B'), 400);
    setTimeout(() => {
      child.stdin.write('\r');
      attributesAnswered = true;
    }, 600);
  }

  if (!isDefaultAnswered && output.includes('Is is_default column in product_variants table created or renamed from another column?')) {
    console.log('--- Answering is_default create ---');
    // It is a new column (option 1)
    child.stdin.write('\r');
    isDefaultAnswered = true;
  }

  if (!sortOrderAnswered && output.includes('Is sort_order column in product_variants table created or renamed from another column?')) {
    console.log('--- Answering sort_order rename ---');
    // Rename from display_order (option 2)
    child.stdin.write('\x1B[B');
    setTimeout(() => {
      child.stdin.write('\r');
      sortOrderAnswered = true;
    }, 300);
  }

  if (!mediaSetAnswered && output.includes('Is media_set column in product_variants table created or renamed from another column?')) {
    console.log('--- Answering media_set create ---');
    // It is a new column (option 1)
    child.stdin.write('\r');
    mediaSetAnswered = true;
  }

  if (!truncateAnswered && output.includes('Do you want to truncate')) {
    console.log('--- Answering truncate Yes ---');
    // Select Yes (option 2)
    child.stdin.write('\x1B[B');
    setTimeout(() => {
      child.stdin.write('\r');
      truncateAnswered = true;
    }, 300);
  }

  if (!applyAnswered && output.includes('Do you still want to push changes?')) {
    console.log('--- Answering apply Yes ---');
    child.stdin.write('\x1B[B'); // Select Yes
    setTimeout(() => {
        child.stdin.write('\r');
        applyAnswered = true;
    }, 300);
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

child.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
  process.exit(code);
});

// Minimal synthetic PostgreSQL frontend for named statement/session isolation probes.
import { connect } from 'node:net';
const z = (s) => Buffer.from(s + '\0');
const int = (n) => {
  const b = Buffer.alloc(4);
  b.writeInt32BE(n);
  return b;
};
const short = (n) => {
  const b = Buffer.alloc(2);
  b.writeInt16BE(n);
  return b;
};
const frame = (tag, ...parts) => {
  const body = Buffer.concat(parts);
  return Buffer.concat([Buffer.from(tag), int(body.length + 4), body]);
};

export async function wire(host, port) {
  const socket = connect({ host, port });
  let buffer = Buffer.alloc(0),
    pending,
    frames = [];
  const receive = () =>
    new Promise((resolve, reject) => {
      if (pending) throw new Error('Only one request per synthetic frontend');
      pending = { resolve, reject };
    });
  socket.on('error', (error) => pending?.reject(error));
  socket.on('data', (data) => {
    buffer = Buffer.concat([buffer, data]);
    while (buffer.length >= 5) {
      const length = buffer.readUInt32BE(1);
      if (buffer.length < length + 1) break;
      const type = String.fromCharCode(buffer[0]),
        body = buffer.subarray(5, length + 1);
      const message = { type };
      if (type === 'E') {
        const fields = body.toString('utf8').split('\0');
        message.code = fields.find((f) => f.startsWith('C'))?.slice(1);
        message.message = fields.find((f) => f.startsWith('M'))?.slice(1);
      }
      if (type === 'D') {
        let offset = 2;
        message.values = [];
        for (let i = 0; i < body.readUInt16BE(0); i++) {
          const size = body.readInt32BE(offset);
          offset += 4;
          message.values.push(size < 0 ? null : body.toString('utf8', offset, offset + size));
          if (size >= 0) offset += size;
        }
      }
      if (type === 'Z') message.status = String.fromCharCode(body[0]);
      frames.push(message);
      buffer = buffer.subarray(length + 1);
      if (type === 'Z') {
        const batch = frames;
        frames = [];
        const waiter = pending;
        pending = undefined;
        waiter?.resolve(batch);
      }
    }
  });
  const ready = receive();
  const startup = Buffer.concat([
    int(196608),
    z('user'),
    z('postgres'),
    z('database'),
    z('postgres'),
    Buffer.from([0]),
  ]);
  socket.write(Buffer.concat([int(startup.length + 4), startup]));
  await ready;
  return {
    async parse(name, sql) {
      const result = receive();
      socket.write(Buffer.concat([frame('P', z(name), z(sql), short(0)), frame('S')]));
      return result;
    },
    async execute(name) {
      const result = receive();
      socket.write(
        Buffer.concat([
          frame('B', z(''), z(name), short(0), short(0), short(0)),
          frame('E', z(''), int(0)),
          frame('S'),
        ]),
      );
      return result;
    },
    close() {
      socket.destroy();
    },
  };
}

// PROTOTYPE: always refresh cache-backed app reads. No business response is substituted.
module.exports = {
  async get() {
    return undefined;
  },
  async set(_key, pendingEntry) {
    const entry = await pendingEntry;
    const reader = entry.value.getReader();
    while (!(await reader.read()).done) {
      /* consume the request-owned stream */
    }
  },
  async refreshTags() {},
  async getExpiration() {
    return 0;
  },
  async updateTags() {},
};

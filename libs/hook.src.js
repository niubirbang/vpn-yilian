let before_ready_hooks = [];
let ready_hooks = [];
let before_quit_hooks = [];

const registryBeforeReady = (name = "", fn = () => {}) => {
  console.log(`registry before ready name: ${name}`);
  before_ready_hooks.push({
    name,
    fn,
  });
};

const registryReady = (name = "", fn = () => {}) => {
  console.log(`registry ready name: ${name}`);
  ready_hooks.push({
    name,
    fn,
  });
};

const registryBeforeQuit = (name = "", fn = () => {}) => {
  console.log(`registry before quit name: ${name}`);
  before_quit_hooks.push({
    name,
    fn,
  });
};

const run = async (app) => {
  console.log(`hook before ready`);
  for (let hook of before_ready_hooks) {
    console.log(`hook ${hook.name} before ready`);
    console.log(hook && hook.fn && typeof hook.fn === "function");
    if (hook && hook.fn && typeof hook.fn === "function") {
      await hook?.fn();
    }
    console.log(`hook ${hook.name} before ready finish`);
  }
  console.log(`hook before ready finish`);

  // app.on("ready", async () => {
    for (let hook of ready_hooks) {
      console.log(`hook ${hook.name} ready`);
      if (hook && hook.fn && typeof hook.fn == "function") {
        await hook?.fn();
      }
      console.log(`hook ${hook.name} ready finish`);
    }
  // });

  app.on("before-quit", async () => {
    for (let hook of before_quit_hooks) {
      console.log(`hook ${hook.name} before quit`);
      if (hook && hook.fn && typeof hook.fn == "function") {
        await hook?.fn();
      }
    }
  });
};

module.exports = {
  registryBeforeReady,
  registryReady,
  registryBeforeQuit,
  run,
};

const { registryBeforeReady, registryBeforeQuit } = require("./hook");
const { Service } = require("./kernel");
const { getConfig, getResourceDir } = require("./util");
const path = require("path");

let service;

const start = async (url, rule, api) => {
  let modeInParam = "abroad";
  switch (rule) {
    case "cn":
      modeInParam = "abroad";
      break;
    case "global":
      modeInParam = "global";
      break;
  }
  const param = {
    mode: modeInParam,
    use: "fixed",
    proxies: [url],
    directRules: [`DOMAIN,${api}`],
  };
  await service.Enable(param);
};
const close = async () => {
  await service.Disable();
};
const statistics = async () => {
  return {
    download_speed: 0,
    upload_speed: 0,
    download_total: 0,
    upload_total: 0,
  };
};
const parse = async (url) => {
  const tmp = await service.ParseURI(url);
  return {
    address: tmp.server,
    port: tmp.port,
    remark: tmp.name,
  };
};
const ping = async (url) => {
  const info = await parse(url);
  const ping = await service.Ping(info.address, info.port);
  return ping;
};

const initialize = async () => {
  let dir = getConfig("SPACE_ENVOY_SERVICE_DIR");
  if (!dir) {
    dir = path.join(getResourceDir(), "service");
  }
  service = new Service({ serverDir: dir });
  if (!(await service.getServerIsRunningByServer())) {
    await service.Install();
  }
  const option = await service.Option();
  console.log("service", "option:", JSON.stringify(option));
};

const before_quit = async () => {
  close().catch((err) => {
    console.error(
      "service",
      "service close on before quit failed:",
      err?.message
    );
  });
};

const init = () => {
  registryBeforeReady("space_envoy", initialize);
  registryBeforeQuit("space_envoy", before_quit);
};

module.exports = {
  init,
  start,
  close,
  statistics,
  parse,
  ping,
};

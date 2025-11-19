const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const { exists, mkdir, read, copy } = require("../libs/util");
const {
  version,
  version_force,
  version_logs,
  updater_server,
  build: { productName },
} = require("../package.json");

const dist_path = path.join(__dirname, "../dist");

const build_zip = (channel_id, platform, arch, install, asar) => {
  const dir_path = path.join(dist_path, `${platform}-${arch}`);
  const dir_zip_path = path.join(
    dist_path,
    `${channel_id}-${platform}-${arch}.zip`
  );
  const version_path = path.join(dir_path, "version.json");
  const install_with_channel_id = path.join(
    path.dirname(install),
    `${channel_id}-${path.basename(install)}`
  );

  copy(install, install_with_channel_id);

  try {
    mkdir(dir_path);
    fs.writeFileSync(
      version_path,
      JSON.stringify(
        {
          version: version,
          force: version_force,
          logs: version_logs,
          install: `${updater_server}/versions/${channel_id}-${platform}-${arch}/${path.basename(
            install_with_channel_id
          )}`,
          asar: `${updater_server}/versions/${channel_id}-${platform}-${arch}/${path.basename(
            asar
          )}`,
        },
        null,
        2
      )
    );
    const zip = new AdmZip();
    zip.addLocalFile(version_path);
    zip.addLocalFile(install_with_channel_id);
    zip.addLocalFile(asar);
    zip.writeZip(dir_zip_path);
  } catch (err) {
    console.error(`package ${platform} ${arch} failed`, err);
  }
  console.info(`package ${platform} ${arch} success`);
};

// channel
const channel_file_path = path.join(__dirname, "../channel.json");
let channel_id = null;
try {
  if (!exists(channel_file_path)) {
    throw new Error(`channel.json not found ${channel_file_path}`);
  }
  const tmp = JSON.parse(read(channel_file_path));
  channel_id = tmp.id;
} catch (err) {
  console.error("package do parse channel failed:", err);
  return;
}

const installers = {
  "win32-x64": path.join(dist_path, `YL-SPEED-win-x64-${version}-setup.exe`),
  "win32-arm64": path.join(
    dist_path,
    `YL-SPEED-win-arm64-${version}-setup.exe`
  ),
  "darwin-x64": path.join(dist_path, `YL-SPEED-mac-x64-${version}-setup.dmg`),
  "darwin-arm64": path.join(
    dist_path,
    `YL-SPEED-mac-arm64-${version}-setup.dmg`
  ),
};
const asars = {
  "win32-x64": path.join(dist_path, `win-unpacked/resources/app.asar`),
  "win32-arm64": path.join(dist_path, `win-arm64-unpacked/resources/app.asar`),
  "darwin-x64": path.join(
    dist_path,
    `mac/${productName}.app/Contents/Resources/app.asar`
  ),
  "darwin-arm64": path.join(
    dist_path,
    `mac-arm64/${productName}.app/Contents/Resources/app.asar`
  ),
};

// build
const build = (platform, arch) => {
  const installer = installers[`${platform}-${arch}`];
  const asar = asars[`${platform}-${arch}`];
  if (exists(installer) && exists(asar)) {
    console.log(`package ${platform} ${arch}`);
    build_zip(channel_id, platform, arch, installer, asar);
  }
};

const findArg = (key) => {
  const name = `--${key}=`;
  const arg = process.argv.find((item) => item.startsWith(name));
  if (arg) {
    return arg.replaceAll(name, "") || undefined;
  }
  return undefined;
};

const platform =
  findArg("platform") || process.env.npm_config_platform || process.platform;
const arch = findArg("arch") || process.env.npm_config_arch || process.arch;

build(platform, arch);

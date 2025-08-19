<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { $OS } from "@/util";

const router = useRouter();
const { t: $t, te: $te } = useI18n();
const os = ref($OS());

const title = computed(() => {
  if (!router.currentRoute.value || !router.currentRoute.value.name) {
    return "";
  }
  const key = `router_${router.currentRoute.value.name}`;
  if ($te(key)) {
    return $t(key);
  }
  return null;
});

const showBackup = computed(() => {
  if (
    router.currentRoute.value.meta &&
    router.currentRoute.value.meta.nobackup
  ) {
    return false;
  }
  return true;
});
const backupPosition = computed(() => {
  switch (os.value) {
    case "mac":
    case "linux":
      return "right";
    case "windows":
      return "left";
    default:
      return "left";
  }
});

const toolsPosition = computed(() => {
  switch (os.value) {
    case "mac":
    case "linux":
      return "left";
    case "windows":
      return "right";
    default:
      return "right";
  }
});
const hoverToolName = ref(null);
const tool_os_order = {
  close: {
    mac: "o1",
    linux: "o1",
    windows: "o2",
  },
  minimize: {
    mac: "o2",
    linux: "o2",
    windows: "o1",
  },
};
const tool_os_size = {
  mac: "1.4rem",
  linux: "1.4rem",
  windows: "1.2rem",
};
const commonTools = computed(() => {
  return [
    {
      type: "icon",
      name: "close",
      size: tool_os_size[os.value],
      iconfontName:
        hoverToolName.value != "close"
          ? `${os.value}-close`
          : `${os.value}-close-hover`,
      order: tool_os_order["close"][os.value],
      f: () => {
        window.box_window.close().catch((err) => {
          console.error(err);
        });
      },
    },
    {
      type: "icon",
      name: "minimize",
      size: tool_os_size[os.value],
      iconfontName:
        hoverToolName.value != "minimize"
          ? `${os.value}-minimize`
          : `${os.value}-minimize-hover`,
      order: tool_os_order["minimize"][os.value],
      f: () => {
        window.box_window.minimize().catch((err) => {
          console.error(err);
        });
      },
    },
  ];
});

const titleClick = () => {};
</script>

<template>
  <div class="box drag">
    <div class="option" :class="backupPosition">
      <div class="backup pointer no-drag" v-if="showBackup" v-back>
        <el-icon size="1.2rem">
          <ArrowLeft />
        </el-icon>
        <span>{{ $t("backup") }}</span>
      </div>
    </div>

    <div class="option center no-drag" @click="titleClick">{{ title }}</div>

    <div class="option tools" :class="toolsPosition">
      <template v-for="(tool, i) in commonTools" :key="i">
        <SvgIconfont
          class="pointer no-drag"
          :class="tool.order"
          :size="tool.size"
          :name="tool.iconfontName"
          @mouseover="hoverToolName = tool.name"
          @mouseleave="hoverToolName = ''"
          @click="tool.f()"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.box {
  height: var(--navbar-height);
  width: 100%;
  box-sizing: border-box;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
}
.option.center {
  /* width: 40%; */
  /* min-width: 1rem; */
  display: flex;
  align-items: center;
  justify-content: center;
  order: 0;
}
.option.left {
  width: 30%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  order: -1;
}
.option.right {
  width: 30%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  order: 1;
}

.backup {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.tools {
  display: flex;
  gap: 0.6rem;
}
.tools .o1 {
  order: 1;
}
.tools .o2 {
  order: 2;
}
</style>
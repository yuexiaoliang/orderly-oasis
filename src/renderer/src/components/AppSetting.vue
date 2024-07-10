<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Refresh } from '@element-plus/icons-vue'
import { useSettingStore } from '@/stores/setting'

const settingStore = useSettingStore()
const { getSettings } = settingStore
const { settings } = storeToRefs(settingStore)

const model = defineModel<boolean>()

const selectSettingsFile = async () => {
  const {
    data: { filePaths }
  } = await window.ipc.openDialog({
    title: '请选择设置文件',
    properties: ['openFile']
  })

  const [path] = filePaths
  if (!path) return

  const { code } = await window.ipc.updateSettings({
    settingsFile: path as string
  })
  if (code !== 0) {
    return
  }

  getSettings()
}
</script>

<template>
  <el-dialog v-model="model" class="app-setting" title="设置" width="70%">
    <el-form>
      <h5>通用设置</h5>
      <el-form-item label="设置文件">
        <el-input :value="settings['settingsFile']" readonly @click="selectSettingsFile">
          <template #append> <el-button :icon="Refresh" @click="getSettings" /> </template>template
        </el-input>
      </el-form-item>

      <h5>按键设置</h5>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="快速搜索">
            <el-input :value="settings['keySearch']" readonly></el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="显示/隐藏主面板">
            <el-input :value="settings['keyToggle']" readonly></el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-dialog>
</template>

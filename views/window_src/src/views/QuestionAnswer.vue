<script setup>
import { ref, onMounted } from 'vue'
import { ElLoading } from 'element-plus'
import { Error } from '@/notification'

// const questions = ref([])
const questions = ref([])
const loading = ref(false)
const current_question = ref(null)
const show_current_question = ref(false)

const load = () => {
  const _loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.questionAnswer().then((data) => {
    questions.value = data
  }).catch(err => {
    Error(err)
  }).finally(() => {
    _loading.close()
  })
}

const show_question_answer = (question) => {
  current_question.value = question
  show_current_question.value = true
}

onMounted(() => {
  load()
})
</script>

<template>
  <div>
    <p class="page-title">常见问题</p>
    <div class="questions">
      <div
        class="question shadow pointer"
        v-for="(question, i) in questions"
        :key="i"
        @click="show_question_answer(question)"
      >
        <p>{{ i+1 }}、{{ question?.title }}</p>
        <el-icon>
          <ArrowRight />
        </el-icon>
      </div>
      <el-button
        class="big-size"
        type="primary"
        round
        icon="Service"
        v-showService
      >
        联系客服
      </el-button>
    </div>
    <el-dialog
      v-model="show_current_question"
      width="70%"
      :title="current_question?.title"
      :close-on-click-modal="true"
      :close-on-press-escape="true"
      :show-close="true"
      :align-center="true"
    >
      <div
        class="question-answer"
        v-html="current_question?.body"
      ></div>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.page-title {
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--el-color-black);
}
.questions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.question {
  box-sizing: border-box;
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
</style>
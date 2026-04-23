<template>
  <q-page class="flex flex-center">
    <q-card style="min-width: 360px">
      <q-card-section>
        <div class="text-h6">Sign in</div>
      </q-card-section>

      <q-card-section v-if="errorMessage">
        <q-banner class="bg-negative text-white" rounded>
          {{ errorMessage }}
        </q-banner>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-btn
          color="dark"
          icon="fab fa-github"
          label="Login with GitHub"
          class="full-width"
          @click="loginGithub"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-gutter-md">
        <q-input v-model="gitlabHost" label="GitLab host" outlined dense />
        <q-btn
          color="orange"
          icon="fab fa-gitlab"
          label="Login with GitLab"
          class="full-width"
          @click="loginGitlab"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { startGitlabLogin } from '../services/gitlab.js'

const route = useRoute()

const gitlabHost = ref('gitlab.com')

const errorMessage = computed(() => {
  if (!route.query.error) return null
  const messages = {
    no_token: 'Authentication failed: no token received.',
    no_code: 'Authentication failed: no code received.',
  }
  return messages[route.query.error] ?? `Authentication error: ${route.query.error}`
})

function loginGithub() {
  const workerUrl = process.env.WORKER_URL
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = `${workerUrl}/auth/github/callback`
  const params = new URLSearchParams({ client_id: clientId, scope: 'repo user', redirect_uri: redirectUri })
  window.location.href = `https://github.com/login/oauth/authorize?${params}`
}

async function loginGitlab() {
  await startGitlabLogin(gitlabHost.value, process.env.GITLAB_CLIENT_ID)
}
</script>

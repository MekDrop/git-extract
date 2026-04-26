<template>
  <div class="wiz-page">
    <div class="wiz-page__head">
      <div class="wiz-page__head-icon">🔑</div>
      <div class="wiz-page__head-text">
        <div class="wiz-page__step-label">Step 2 of 4</div>
        <h1 class="wiz-page__title">Sign In</h1>
        <p class="wiz-page__desc">
          Select a Git provider, then click <strong>Sign In &gt;</strong> to connect your account.
        </p>
      </div>
    </div>

    <div class="wiz-page__body">

      <!-- Error banner -->
      <div v-if="errorMessage" class="login-error">⚠ {{ errorMessage }}</div>

      <label class="w98-field-label" style="margin-bottom:6px;display:block">
        Select a provider:
      </label>

      <!-- ── Provider list ───────────────────────────────────────── -->
      <div class="provider-listbox" @keydown="onKeyDown" tabindex="0">
        <div
          v-for="p in providers"
          :key="p.id"
          class="provider-row"
          :class="{ 'provider-row--selected': selected === p.id }"
          @click="selected = p.id"
          @dblclick="proceed"
        >
          <q-icon :name="p.icon" class="provider-row__icon" :class="`provider-row__icon--${p.id}`" />
          <div class="provider-row__info">
            <span class="provider-row__name">{{ p.name }}</span>
            <span class="provider-row__meta">{{ p.meta }}</span>
          </div>
        </div>
      </div>

      <!-- ── GitLab host (only when GitLab selected) ─────────────── -->
      <transition name="slide">
        <div v-if="selected === 'gitlab'" class="gitlab-host-box">
          <div class="w98-group-box">
            <div class="w98-group-box__label">GitLab Instance</div>
            <div class="w98-group-box__body">
              <label class="w98-field-label" for="gl-host" style="display:block;margin-bottom:4px">
                Host:
              </label>
              <input
                id="gl-host"
                v-model="gitlabHost"
                class="w98-input-host"
                placeholder="gitlab.com"
                spellcheck="false"
              />
              <div class="host-hint">
                Use <code>gitlab.com</code> for the public instance.
                Change for a self-hosted GitLab server.
              </div>
            </div>
          </div>
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { startGitlabLogin } from '../services/gitlab.js'
import { useWizardNav } from '../composables/useWizardNav.js'

const route      = useRoute()
const router     = useRouter()
const nav        = useWizardNav()
const selected   = ref(null)          // 'github' | 'gitlab' | null
const gitlabHost = ref('gitlab.com')

const providers = [
  { id: 'github', name: 'GitHub',  icon: 'fab fa-github', meta: 'OAuth · public & private repos' },
  { id: 'gitlab', name: 'GitLab',  icon: 'fab fa-gitlab', meta: 'PKCE · gitlab.com or self-hosted' },
]

onMounted(updateNav)
watch(selected, updateNav)

function updateNav() {
  nav.value = {
    backLabel: '< Back',
    backDisabled: false,
    onBack: () => router.push('/welcome'),
    nextLabel: selected.value ? 'Sign In >' : 'Next >',
    nextDisabled: !selected.value,
    onNext: selected.value ? () => proceed() : null,
    finishLabel: 'Finish',
    finishDisabled: true,
    onFinish: null,
  }
}

const errorMessage = computed(() => {
  if (!route.query.error) return null
  const map = {
    no_token: 'Authentication failed: no token received.',
    no_code:  'Authentication failed: no code received.',
  }
  return map[route.query.error] ?? `Authentication error: ${route.query.error}`
})

function onKeyDown(e) {
  const ids = providers.map((p) => p.id)
  const idx = ids.indexOf(selected.value)
  if (e.key === 'ArrowDown') {
    selected.value = ids[Math.min(idx + 1, ids.length - 1)]
    e.preventDefault()
  } else if (e.key === 'ArrowUp') {
    selected.value = ids[Math.max(idx - 1, 0)]
    e.preventDefault()
  } else if (e.key === 'Enter' && selected.value) {
    proceed()
  }
}

async function proceed() {
  if (selected.value === 'github') loginGithub()
  else if (selected.value === 'gitlab') await loginGitlab()
}

function loginGithub() {
  const workerUrl   = process.env.WORKER_URL
  const clientId    = process.env.GITHUB_CLIENT_ID
  const redirectUri = `${workerUrl}/auth/github/callback`
  const params = new URLSearchParams({ client_id: clientId, scope: 'repo user', redirect_uri: redirectUri })
  window.location.href = `https://github.com/login/oauth/authorize?${params}`
}

async function loginGitlab() {
  await startGitlabLogin(gitlabHost.value, process.env.GITLAB_CLIENT_ID)
}
</script>

<style lang="scss" scoped>
// ── Error banner ───────────────────────────────────────────────────
.login-error {
  font-size: 11px;
  padding: 5px 10px;
  margin-bottom: 12px;
  border: 2px solid #c10015;
  background: #ffeeee;
  color: #c10015;
  max-width: 420px;
}

// ── Provider list box ──────────────────────────────────────────────
.provider-listbox {
  max-width: 360px;
  background: #fff;
  margin-bottom: 14px;
  outline: none;

  // Classic Win98 sunken listbox border
  box-shadow:
    inset  1px  1px #0a0a0a,
    inset -1px -1px #ffffff,
    inset  2px  2px #808080,
    inset -2px -2px #e8e8e8;

  &:focus-within .provider-row--selected {
    background: $primary;
    color: #fff;

    .provider-row__meta           { color: rgba(255,255,255,0.65); }
    .provider-row__icon           { color: #fff; }
    .provider-row__icon--gitlab   { color: #fff; }
  }
}

.provider-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  cursor: default;
  border-bottom: 1px solid #ececec;
  user-select: none;

  &:last-child { border-bottom: none; }

  &:hover:not(.provider-row--selected) {
    background: $accent; // #6BBF89 — subtle hover
    color: #000;
  }

  // Unfocused selection (grey like Win98)
  &--selected {
    background: #808080;
    color: #fff;

    .provider-row__meta         { color: rgba(255,255,255,0.7); }
    .provider-row__icon         { color: #fff; }
    .provider-row__icon--gitlab { color: #fff; }
  }

  &__icon {
    font-size: 18px !important;
    flex-shrink: 0;
    color: #333;

    &--gitlab { color: #e24329; }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  &__name {
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  &__meta {
    font-size: 10px;
    color: #808080;
    white-space: nowrap;
  }
}

// ── GitLab host group box ──────────────────────────────────────────
.gitlab-host-box { max-width: 360px; }

.w98-group-box {
  border: 1px solid #808080;
  box-shadow: 1px 1px 0 #fff;
  padding: 0 10px 10px;
  position: relative;
  margin-top: 6px;

  &__label {
    position: absolute;
    top: -8px;
    left: 8px;
    background: #fff;
    padding: 0 3px;
    font-size: 11px;
    font-weight: 700;
    color: #000;
  }

  &__body { padding-top: 10px; }
}

.w98-input-host {
  width: 100%;
  height: 21px;
  padding: 2px 4px;
  font-family: 'Tahoma', 'MS Sans Serif', Arial, sans-serif;
  font-size: 12px;
  border: none;
  box-shadow:
    inset  1px  1px #0a0a0a,
    inset -1px -1px #ffffff,
    inset  2px  2px #808080,
    inset -2px -2px #e8e8e8;
  background: #fff;
  box-sizing: border-box;
  margin-bottom: 5px;
}

.host-hint {
  font-size: 10px;
  color: #808080;
  line-height: 1.4;

  code {
    font-family: 'Courier New', monospace;
    font-size: 10px;
    background: #e8e8e8;
    padding: 0 2px;
  }
}

// ── Slide-down transition ──────────────────────────────────────────
.slide-enter-active { transition: opacity 0.15s, transform 0.15s; }
.slide-leave-active { transition: opacity 0.1s,  transform 0.1s; }
.slide-enter-from   { opacity: 0; transform: translateY(-4px); }
.slide-leave-to     { opacity: 0; transform: translateY(-4px); }
</style>

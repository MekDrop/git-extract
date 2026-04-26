<template>
  <!-- Win98-style desktop — dark navy instead of teal -->
  <div class="w98-desktop">
    <div class="w98-window">

      <!-- ── Title bar ──────────────────────────────────────────── -->
      <div class="w98-titlebar">
        <span class="w98-titlebar__icon">⎇</span>
        <span class="w98-titlebar__text">git-extract Setup</span>
        <div class="w98-titlebar__controls">
          <div class="w98-chrome-btn">_</div>
          <div class="w98-chrome-btn">□</div>
          <div class="w98-chrome-btn w98-chrome-btn--close">✕</div>
        </div>
      </div>

      <!-- ── Body ──────────────────────────────────────────────── -->
      <div class="w98-body">

        <!-- Left product panel -->
        <div class="w98-sidebar">
          <div class="w98-sidebar__logo">⎇</div>
          <div class="w98-sidebar__product">git-extract</div>
          <div class="w98-sidebar__tagline">Setup Wizard</div>

          <div class="w98-sidebar__divider" />

          <div
            v-for="step in steps"
            :key="step.id"
            class="w98-sidebar__step"
            :class="{
              'w98-sidebar__step--active': currentStep === step.id,
              'w98-sidebar__step--done':   currentStep > step.id,
            }"
          >
            <span class="w98-sidebar__arrow">
              {{ currentStep > step.id ? '✔' : currentStep === step.id ? '►' : '○' }}
            </span>
            <span>{{ step.label }}</span>
          </div>

          <div v-if="auth.isLoggedIn" class="w98-sidebar__user">
            <img
              v-if="auth.user?.avatar_url"
              :src="auth.user.avatar_url"
              class="w98-sidebar__avatar"
            />
            <span class="w98-sidebar__username">
              {{ auth.user?.login || auth.user?.username }}
            </span>
          </div>
        </div>

        <!-- Right content pane -->
        <div class="w98-content">
          <router-view />
        </div>

      </div>

      <!-- ── Footer / button bar ───────────────────────────────── -->
      <div class="w98-footer">
        <div class="w98-sep" />
        <div class="w98-footer__inner">
          <div class="w98-footer__status">
            Step {{ currentStep }} of {{ steps.length }}
            <template v-if="auth.isLoggedIn">
              &nbsp;·&nbsp;
              <button class="w98-link-btn" @click="logout">Sign out</button>
            </template>
          </div>

          <div class="w98-footer__nav">
            <button
              v-if="nav.onBack"
              class="w98-btn"
              @click="nav.onBack"
            >{{ nav.backLabel }}</button>

            <button
              v-if="nav.onNext"
              class="w98-btn w98-btn--primary"
              :disabled="nav.nextDisabled"
              @click="nav.onNext"
            >{{ nav.nextLabel }}</button>

            <div class="w98-btn-sep" />

            <button class="w98-btn" @click="logout">Cancel</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { provideWizardNav } from '../composables/useWizardNav.js'

const auth   = useAuthStore()
const route  = useRoute()
const router = useRouter()
const nav    = provideWizardNav()

const steps = [
  { id: 1, label: 'Welcome' },
  { id: 2, label: 'Sign In' },
  { id: 3, label: 'Select Repository' },
  { id: 4, label: 'Configure & Extract' },
]

const currentStep = computed(() => {
  const p = route.path
  if (p === '/' || p === '/welcome')      return 1
  if (p === '/login' || p.startsWith('/auth')) return 2
  if (p === '/repos')                     return 3
  if (p === '/extract')                   return 4
  return 1
})

function logout() {
  auth.logout()
  router.push('/welcome')
}
</script>

<style lang="scss">
* { font-family: 'Tahoma', 'MS Sans Serif', Arial, sans-serif; }

// ── Desktop ────────────────────────────────────────────────────
.w98-desktop {
  position: fixed;
  inset: 0;
  background: $primary; // #011826 dark navy desktop
  display: flex;
  align-items: center;
  justify-content: center;
}

// ── Window ─────────────────────────────────────────────────────
.w98-window {
  display: flex;
  flex-direction: column;
  width: min(860px, 98vw);
  height: min(560px, 96vh);
  background: #F2F2F2;
  box-shadow:
    inset -1px -1px #0a0a0a,
    inset  1px  1px #ffffff,
    inset -2px -2px #808080,
    inset  2px  2px #e8e8e8;
}

// ── Title bar ──────────────────────────────────────────────────
.w98-titlebar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px 3px 6px;
  background: linear-gradient(to right, $primary 0%, #0d3a5c 100%);
  flex-shrink: 0;
  user-select: none;

  &__icon { font-size: 12px; color: $accent; }
  &__text {
    flex: 1;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
  }
  &__controls { display: flex; gap: 2px; }
}

.w98-chrome-btn {
  width: 16px;
  height: 14px;
  background: #F2F2F2;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  color: #000;
  box-shadow:
    inset -1px -1px #0a0a0a,
    inset  1px  1px #ffffff,
    inset -2px -2px #808080,
    inset  2px  2px #e8e8e8;

  &--close { margin-left: 2px; }
}

// ── Body ───────────────────────────────────────────────────────
.w98-body {
  display: flex;
  flex: 1;
  min-height: 0;
  margin: 3px;
  gap: 3px;
}

// ── Sidebar ────────────────────────────────────────────────────
.w98-sidebar {
  width: 176px;
  flex-shrink: 0;
  background: $primary;
  padding: 20px 0 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    inset  1px  1px rgba(255,255,255,0.08),
    inset -1px -1px rgba(0,0,0,0.3);

  &__logo    { text-align: center; font-size: 32px; color: $secondary; margin-bottom: 6px; }
  &__product { text-align: center; font-size: 16px; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
  &__tagline {
    text-align: center;
    font-size: 10px;
    color: rgba(255,255,255,0.45);
    margin-top: 2px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  &__divider {
    margin: 14px 16px;
    border: none;
    border-top: 1px solid rgba(255,255,255,0.1);
    border-bottom: 1px solid rgba(0,0,0,0.4);
  }

  &__step {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    padding: 5px 14px;
    font-size: 11px;
    color: rgba(255,255,255,0.35);
    line-height: 1.3;

    &--active {
      color: #fff;
      font-weight: 700;
      background: rgba(255,255,255,0.07);
    }
    &--done { color: $accent; } // #6BBF89 sage green for done steps
  }

  &__arrow { flex-shrink: 0; font-size: 10px; margin-top: 1px; }

  &__user {
    margin-top: auto;
    padding: 10px 14px 0;
    display: flex;
    align-items: center;
    gap: 6px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  &__avatar {
    width: 20px;
    height: 20px;
    border-radius: 2px;
    object-fit: cover;
  }

  &__username {
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// ── Content pane ───────────────────────────────────────────────
.w98-content {
  flex: 1;
  overflow-y: auto;
  background: #fff;
  box-shadow:
    inset  1px  1px #808080,
    inset -1px -1px #e8e8e8,
    inset  2px  2px #0a0a0a,
    inset -2px -2px #ffffff;
}

// ── Footer ─────────────────────────────────────────────────────
.w98-footer { flex-shrink: 0; padding: 0 4px 4px; }

.w98-sep {
  height: 0;
  margin: 0 0 4px;
  border-top: 1px solid #808080;
  border-bottom: 1px solid #fff;
}

.w98-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.w98-footer__status {
  font-size: 11px;
  color: #444;
  padding-left: 4px;
}

.w98-footer__nav { display: flex; align-items: center; gap: 4px; }

.w98-btn-sep {
  width: 1px;
  height: 20px;
  background: #808080;
  margin: 0 4px;
  box-shadow: 1px 0 #fff;
}

// ── Win98 buttons ──────────────────────────────────────────────
.w98-btn {
  min-width: 75px;
  height: 23px;
  padding: 0 10px;
  background: #F2F2F2;
  color: #000;
  font-family: 'Tahoma', 'MS Sans Serif', Arial, sans-serif;
  font-size: 11px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  box-shadow:
    inset -1px -1px #0a0a0a,
    inset  1px  1px #ffffff,
    inset -2px -2px #808080,
    inset  2px  2px #e8e8e8;

  &:active:not(:disabled) {
    box-shadow:
      inset -1px -1px #ffffff,
      inset  1px  1px #0a0a0a,
      inset -2px -2px #e8e8e8,
      inset  2px  2px #808080;
    padding: 1px 9px 0 11px;
  }

  &:disabled {
    color: #808080;
    cursor: default;
    text-shadow: 1px 1px #fff;
  }

  &--primary {
    background: $secondary; // #168C40 forest green
    color: #fff;
    font-weight: 700;
    box-shadow:
      inset -1px -1px #000,
      inset  1px  1px #6BBF89,
      inset -2px -2px #0d5a28,
      inset  2px  2px #2db85a;

    &:active:not(:disabled) {
      box-shadow:
        inset -1px -1px #6BBF89,
        inset  1px  1px #000,
        inset -2px -2px #2db85a,
        inset  2px  2px #0d5a28;
      padding: 1px 9px 0 11px;
    }

    &:disabled {
      background: #A7D9B8;
      color: #6BBF89;
      text-shadow: none;
    }
  }
}

.w98-link-btn {
  background: none;
  border: none;
  color: $accent; // #6BBF89
  font-size: 11px;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  font-family: inherit;
}
</style>

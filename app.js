import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.116.0'

const SUPABASE_URL = 'https://agkjutuvfjcahckhjkra.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6oA2tFA2W-yfzK6GpL4Bhw_prNXvyvd'
const API_URL = `${SUPABASE_URL}/functions/v1/admin-licenses-api`

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
let allLicenses = []
let exactLicense = null

const $ = (id) => document.getElementById(id)
const loginView = $('loginView')
const dashboardView = $('dashboardView')
const licenseList = $('licenseList')
const emptyState = $('emptyState')
const flash = $('flash')

function fmtDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

function statusLabel(status) {
  return ({ active: 'Ativa', pending: 'Pendente', expired: 'Expirada', revoked: 'Revogada' })[status] ?? status
}

function durationText(seconds) {
  if (!seconds) return '—'
  const days = Math.floor(seconds / 86400)
  if (days >= 365) return `${(days / 365).toFixed(days % 365 ? 1 : 0)} ano(s)`
  if (days >= 1) return `${days} dia(s)`
  const hours = Math.floor(seconds / 3600)
  return `${hours} hora(s)`
}

async function session() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

async function api(body) {
  const s = await session()
  if (!s) throw new Error('Sessão expirada. Entre novamente.')

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${s.access_token}`,
    },
    body: JSON.stringify(body),
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const err = new Error(payload.error || `Erro ${response.status}`)
    err.code = payload.error
    throw err
  }
  return payload
}

function showFlash(message) {
  flash.textContent = message
  flash.classList.remove('hidden')
  clearTimeout(showFlash.timer)
  showFlash.timer = setTimeout(() => flash.classList.add('hidden'), 3000)
}

function updateSummary(summary = {}) {
  $('statActive').textContent = summary.active ?? 0
  $('statPending').textContent = summary.pending ?? 0
  $('statExpired').textContent = summary.expired ?? 0
  $('statRevoked').textContent = summary.revoked ?? 0
}

function licenseCard(l) {
  const note = l.note?.trim() || 'Sem observação'
  const revokeButton = l.status === 'revoked'
    ? `<button class="mini success" data-action="reactivate" data-id="${l.id}">Reativar</button>`
    : `<button class="mini danger" data-action="revoke" data-id="${l.id}">Desativar</button>`

  return `
    <article class="license-card glass" data-license="${l.id}">
      <div class="license-main">
        <div class="license-head">
          <span class="badge ${l.status}">${statusLabel(l.status)}</span>
          <span class="key-hint">${l.key_hint ?? ''}</span>
        </div>
        <div class="license-title">${escapeHtml(note)}</div>
        <div class="meta">
          <span>Expira: <b>${fmtDate(l.expires_at)}</b></span>
          <span>Aparelhos: <b>${l.device_count}/${l.max_devices}</b></span>
          <span>Duração: <b>${escapeHtml(l.duration_label || durationText(l.duration_seconds))}</b></span>
          <span>Criada: <b>${fmtDate(l.created_at)}</b></span>
        </div>
      </div>
      <div class="actions">
        <div class="action-row">
          ${revokeButton}
          <button class="mini" data-action="edit" data-id="${l.id}">Editar</button>
        </div>
        <div class="action-row">
          <button class="mini" data-action="add" data-seconds="86400" data-id="${l.id}">+1d</button>
          <button class="mini" data-action="add" data-seconds="604800" data-id="${l.id}">+7d</button>
          <button class="mini" data-action="add" data-seconds="2592000" data-id="${l.id}">+30d</button>
          <button class="mini" data-action="add" data-seconds="31536000" data-id="${l.id}">+1a</button>
        </div>
        <button class="mini" data-action="reset" data-id="${l.id}">Resetar aparelhos</button>
      </div>
    </article>`
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[c]))
}

function render(list = allLicenses) {
  licenseList.innerHTML = list.map(licenseCard).join('')
  emptyState.classList.toggle('hidden', list.length !== 0)
}

async function loadDashboard() {
  const data = await api({ action: 'dashboard' })
  allLicenses = data.licenses ?? []
  exactLicense = null
  updateSummary(data.summary)
  render()
}

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  $('loginError').textContent = ''
  $('loginButton').disabled = true
  $('loginButton').textContent = 'Entrando…'
  const { error } = await supabase.auth.signInWithPassword({
    email: $('email').value.trim(),
    password: $('password').value,
  })
  $('loginButton').disabled = false
  $('loginButton').textContent = 'Entrar'
  if (error) {
    $('loginError').textContent = 'E-mail ou senha inválidos.'
    return
  }
  await boot()
})

$('logoutButton').addEventListener('click', async () => {
  await supabase.auth.signOut()
  dashboardView.classList.add('hidden')
  loginView.classList.remove('hidden')
})

$('refreshButton').addEventListener('click', async () => {
  $('refreshButton').textContent = '…'
  try { await loadDashboard() } catch (e) { showFlash(e.message) }
  $('refreshButton').textContent = '↻'
})

$('searchInput').addEventListener('input', () => {
  const q = $('searchInput').value.trim().toLowerCase()
  if (!q) { render(allLicenses); return }
  if (q.startsWith('3105-')) return
  render(allLicenses.filter(l =>
    (l.note || '').toLowerCase().includes(q) ||
    (l.key_hint || '').toLowerCase().includes(q) ||
    statusLabel(l.status).toLowerCase().includes(q)
  ))
})

$('exactSearchButton').addEventListener('click', async () => {
  const key = $('searchInput').value.trim()
  if (!key) { showFlash('Cole uma key no campo de busca.'); return }
  try {
    const data = await api({ action: 'search', key })
    if (!data.found) { render([]); showFlash('Key não encontrada.'); return }
    exactLicense = data.license
    render([data.license])
  } catch (e) { showFlash(e.message) }
})

$('createButton').addEventListener('click', () => $('createDialog').showModal())
$('createForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  $('submitCreate').disabled = true
  $('submitCreate').textContent = 'Gerando…'
  try {
    const data = await api({
      action: 'create',
      duration: $('createDuration').value,
      max_devices: Number($('createDevices').value),
      note: $('createNote').value.trim(),
    })
    $('createDialog').close()
    $('createdKey').textContent = data.created.license_key
    $('resultDialog').showModal()
    $('createNote').value = ''
    await loadDashboard()
  } catch (e) { showFlash(e.message) }
  $('submitCreate').disabled = false
  $('submitCreate').textContent = 'Gerar key'
})

$('closeResult').addEventListener('click', () => $('resultDialog').close())
$('copyCreatedKey').addEventListener('click', async () => {
  const key = $('createdKey').textContent
  await navigator.clipboard.writeText(key)
  showFlash('Key copiada.')
})

licenseList.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]')
  if (!btn) return
  const id = btn.dataset.id
  const action = btn.dataset.action
  const l = [...allLicenses, ...(exactLicense ? [exactLicense] : [])].find(x => x.id === id)

  try {
    btn.disabled = true
    if (action === 'revoke') {
      if (!confirm('Desativar esta licença agora?')) return
      await api({ action: 'revoke', license_id: id })
      showFlash('Licença desativada.')
    } else if (action === 'reactivate') {
      await api({ action: 'reactivate', license_id: id })
      showFlash('Licença reativada. Se estiver expirada, adicione tempo.')
    } else if (action === 'add') {
      await api({ action: 'add_time', license_id: id, seconds: Number(btn.dataset.seconds) })
      showFlash('Tempo adicionado.')
    } else if (action === 'reset') {
      if (!confirm('Resetar todos os aparelhos vinculados a esta licença?')) return
      await api({ action: 'reset_devices', license_id: id })
      showFlash('Aparelhos resetados.')
    } else if (action === 'edit') {
      $('editLicenseId').value = id
      $('editTitle').textContent = l?.note || 'Licença'
      $('editNote').value = l?.note || ''
      $('editDevices').value = l?.max_devices || 1
      $('editDialog').showModal()
      return
    }
    await loadDashboard()
  } catch (err) {
    showFlash(err.message)
  } finally {
    btn.disabled = false
  }
})

$('editForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const id = $('editLicenseId').value
  const note = $('editNote').value.trim()
  const maxDevices = Number($('editDevices').value)
  $('saveEdit').disabled = true
  try {
    await api({ action: 'set_note', license_id: id, note })
    await api({ action: 'set_max_devices', license_id: id, max_devices: maxDevices })
    $('editDialog').close()
    showFlash('Licença atualizada.')
    await loadDashboard()
  } catch (err) { showFlash(err.message) }
  $('saveEdit').disabled = false
})

async function boot() {
  const s = await session()
  if (!s) {
    dashboardView.classList.add('hidden')
    loginView.classList.remove('hidden')
    return
  }
  loginView.classList.add('hidden')
  dashboardView.classList.remove('hidden')
  try {
    await loadDashboard()
  } catch (e) {
    if (e.code === 'forbidden' || e.code === 'unauthorized') {
      await supabase.auth.signOut()
      dashboardView.classList.add('hidden')
      loginView.classList.remove('hidden')
      $('loginError').textContent = 'Este usuário não tem acesso ao painel.'
    } else {
      showFlash(e.message)
    }
  }
}

boot()

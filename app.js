import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.116.0'

const SUPABASE_URL = 'https://agkjutuvfjcahckhjkra.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6oA2tFA2W-yfzK6GpL4Bhw_prNXvyvd'
const API_URL = `${SUPABASE_URL}/functions/v1/admin-licenses-api`
const PATCH_API_URL = `${SUPABASE_URL}/functions/v1/admin-patches-api`

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
let allLicenses = []
let exactLicense = null
let allPatches = []
let activePanel = 'keys'
const KNOWN_KEYS_STORAGE = 'satanabe_admin_known_keys_v1'
let knownKeys = loadKnownKeys()

function loadKnownKeys() {
  try { return JSON.parse(localStorage.getItem(KNOWN_KEYS_STORAGE) || '{}') || {} }
  catch { return {} }
}

function rememberKey(licenseID, key) {
  if (!licenseID || !key) return
  knownKeys[licenseID] = key.trim().toUpperCase()
  localStorage.setItem(KNOWN_KEYS_STORAGE, JSON.stringify(knownKeys))
}

async function loadServerKeyMap() {
  const { data, error } = await supabase.rpc('admin_get_key_values')
  if (error) throw new Error('Não foi possível carregar as keys completas.')
  const map = {}
  for (const row of data || []) {
    if (row?.license_id && row?.license_key) {
      map[row.license_id] = row.license_key.trim().toUpperCase()
      rememberKey(row.license_id, row.license_key)
    }
  }
  return map
}

const $ = (id) => document.getElementById(id)
const loginView = $('loginView')
const dashboardView = $('dashboardView')
const licenseList = $('licenseList')
const emptyState = $('emptyState')
const flash = $('flash')
const patchFlash = $('patchFlash')
const keysPanel = $('keysPanel')
const patchesPanel = $('patchesPanel')
const patchList = $('patchList')
const patchEmptyState = $('patchEmptyState')

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

function validatePatchFile(file) {
  if (!file) throw new Error('Selecione um arquivo .3105.')
  if (!file.name.toLowerCase().endsWith('.3105')) throw new Error('O arquivo precisa terminar em .3105.')
  if (file.size <= 0) throw new Error('O arquivo está vazio.')
  if (file.size > 50 * 1024 * 1024) throw new Error('O arquivo é maior que 50 MB.')
}

function safePatchFileName(name) {
  return String(name || 'patch.3105')
    .trim()
    .replace(/[^a-zA-Z0-9._()\- ]+/g, '-')
    .replace(/\s+/g, ' ') || 'patch.3105'
}

async function uploadPatchFile(file, patchID) {
  validatePatchFile(file)
  const path = `admin-uploads/${patchID}/${Date.now()}-${safePatchFileName(file.name)}`
  const { error } = await supabase.storage
    .from('patches-3105')
    .upload(path, file, { upsert: false, cacheControl: '0', contentType: 'application/octet-stream' })
  if (error) throw new Error(`Falha no upload: ${error.message}`)
  return path
}

async function setPatchMetadata(patchID, values) {
  const { error } = await supabase
    .from('patch_catalog')
    .update(values)
    .eq('id', patchID)
  if (error) throw new Error(`Não foi possível salvar o patch: ${error.message}`)
}

async function replacePatchFile(patch, file) {
  const newPath = await uploadPatchFile(file, patch.id)
  const wasEnabled = !!patch.enabled
  try {
    if (wasEnabled) await patchApi({ action: 'set_enabled', patch_id: patch.id, enabled: false })
    await setPatchMetadata(patch.id, { storage_path: newPath })
    if (wasEnabled) await patchApi({ action: 'set_enabled', patch_id: patch.id, enabled: true })
    return newPath
  } catch (e) {
    try { await supabase.storage.from('patches-3105').remove([newPath]) } catch {}
    if (wasEnabled) { try { await patchApi({ action: 'set_enabled', patch_id: patch.id, enabled: true }) } catch {} }
    throw e
  }
}

async function session() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

async function callApi(url, body) {
  const s = await session()
  if (!s) throw new Error('Sessão expirada. Entre novamente.')

  const response = await fetch(url, {
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

const api = (body) => callApi(API_URL, body)
const patchApi = (body) => callApi(PATCH_API_URL, body)

function showFlash(message, target = flash) {
  target.textContent = message
  target.classList.remove('hidden')
  clearTimeout(target._flashTimer)
  target._flashTimer = setTimeout(() => target.classList.add('hidden'), 3000)
}

function updateSummary(summary = {}) {
  $('statActive').textContent = summary.active ?? 0
  $('statPending').textContent = summary.pending ?? 0
  $('statExpired').textContent = summary.expired ?? 0
  $('statRevoked').textContent = summary.revoked ?? 0
}

function updatePatchSummary(summary = {}) {
  $('patchStatActive').textContent = summary.active ?? 0
  $('patchStatDisabled').textContent = summary.disabled ?? 0
  $('patchStatTotal').textContent = summary.total ?? 0
}

function patchCard(p) {
  const statusClass = p.enabled ? 'patch-on' : 'patch-off'
  const statusText = p.enabled ? 'Ativo' : 'Desativado'
  const buttonClass = p.enabled ? 'danger' : 'success'
  const buttonText = p.enabled ? 'Desativar' : 'Ativar'
  return `
    <article class="patch-card glass" data-patch="${p.id}">
      <div class="patch-main">
        <div class="patch-head">
          <span class="badge ${statusClass}">${statusText}</span>
          <span class="patch-name">${escapeHtml(p.name || 'Patch')}</span>
        </div>
        <div class="patch-description">${escapeHtml(p.description || 'Sem descrição')}</div>
        <div class="patch-path">${escapeHtml(p.storage_path || 'Sem arquivo')}</div>
      </div>
      <div class="patch-action">
        <button class="mini" data-patch-action="edit" data-id="${p.id}">Editar</button>
        <button class="mini ${buttonClass}" data-patch-action="toggle" data-id="${p.id}" data-enabled="${String(!p.enabled)}">${buttonText}</button>
      </div>
    </article>`
}

function renderPatches() {
  patchList.innerHTML = allPatches.map(patchCard).join('')
  patchEmptyState.classList.toggle('hidden', allPatches.length !== 0)
}

async function loadPatches() {
  const data = await patchApi({ action: 'list' })
  allPatches = data.patches ?? []
  updatePatchSummary(data.summary)
  renderPatches()
}

async function showPanel(name) {
  activePanel = name === 'patches' ? 'patches' : 'keys'
  const patchesActive = activePanel === 'patches'
  keysPanel.classList.toggle('hidden', patchesActive)
  patchesPanel.classList.toggle('hidden', !patchesActive)
  $('tabKeys').classList.toggle('active', !patchesActive)
  $('tabPatches').classList.toggle('active', patchesActive)
  $('pageTitle').textContent = patchesActive ? 'Patches' : 'Licenças'
  if (patchesActive) await loadPatches()
  else await loadDashboard()
}

function licenseCard(l) {
  const note = l.note?.trim() || 'Sem observação'
  const fullKey = l.license_key || knownKeys[l.id] || null
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
        <div class="stored-key ${fullKey ? '' : 'missing'}">
          <span>${fullKey ? escapeHtml(fullKey) : 'Key antiga — toque em Copiar e cadastre a key original uma vez'}</span>
          <button class="copy-key" data-action="copy-key" data-id="${l.id}">Copiar</button>
        </div>
        ${fullKey ? '' : '<div class="key-help">As keys antigas eram salvas apenas como hash, então não podem ser reconstruídas. Ao informar a original uma vez, ela passa a ficar disponível no painel.</div>'}
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
  allLicenses = (data.licenses ?? []).map(l => ({
    ...l,
    license_key: l.license_key || knownKeys[l.id] || null,
  }))

  // Migra automaticamente keys que este iPhone já conhecia para o armazenamento
  // administrativo do servidor, sem pedir novamente.
  for (const license of allLicenses) {
    if (license.license_key || !knownKeys[license.id]) continue
    try {
      const found = await api({ action: 'search', key: knownKeys[license.id] })
      if (found?.found && found.license?.id === license.id) {
        license.license_key = found.license.license_key || knownKeys[license.id]
      }
    } catch {}
  }

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
  try {
    if (activePanel === 'patches') await loadPatches()
    else await loadDashboard()
  } catch (e) {
    showFlash(e.message, activePanel === 'patches' ? patchFlash : flash)
  }
  $('refreshButton').textContent = '↻'
})

$('tabKeys').addEventListener('click', async () => {
  try { await showPanel('keys') } catch (e) { showFlash(e.message) }
})

$('tabPatches').addEventListener('click', async () => {
  try { await showPanel('patches') } catch (e) { showFlash(e.message, patchFlash) }
})

$('enableAllPatches').addEventListener('click', async () => {
  const button = $('enableAllPatches')
  button.disabled = true
  button.textContent = 'Ativando…'
  try {
    const data = await patchApi({ action: 'set_all_enabled', enabled: true })
    showFlash(`${Number(data.count) || 0} patch(es) disponibilizado(s).`, patchFlash)
    await loadPatches()
  } catch (e) { showFlash(e.message, patchFlash) }
  finally { button.disabled = false; button.textContent = 'Ativar todos' }
})

$('disableAllPatches').addEventListener('click', async () => {
  if (!confirm('Desativar todos os patches agora? Isso também zera as preferências de ativação salvas no Supabase.')) return
  const button = $('disableAllPatches')
  button.disabled = true
  button.textContent = 'Desativando…'
  try {
    const data = await patchApi({ action: 'set_all_enabled', enabled: false })
    showFlash(`${Number(data.count) || 0} patch(es) desativado(s).`, patchFlash)
    await loadPatches()
  } catch (e) { showFlash(e.message, patchFlash) }
  finally { button.disabled = false; button.textContent = 'Desativar todos' }
})

$('importPatchButton').addEventListener('click', () => {
  $('importPatchForm').reset()
  $('importPatchEnabled').value = 'true'
  $('importPatchProgress').classList.add('hidden')
  $('importPatchDialog').showModal()
})

$('importPatchForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const name = $('importPatchName').value.trim()
  const description = $('importPatchDescription').value.trim()
  const file = $('importPatchFile').files?.[0]
  const enabled = $('importPatchEnabled').value === 'true'
  const button = $('submitImportPatch')
  const progress = $('importPatchProgress')

  button.disabled = true
  progress.textContent = 'Enviando o arquivo para o Supabase…'
  progress.classList.remove('hidden')
  let uploadedPath = null
  try {
    if (!name) throw new Error('Digite o nome do patch.')
    validatePatchFile(file)
    const patchID = crypto.randomUUID()
    uploadedPath = await uploadPatchFile(file, patchID)
    progress.textContent = 'Salvando o patch no catálogo…'
    const { error } = await supabase.from('patch_catalog').insert({
      id: patchID,
      name,
      description,
      storage_path: uploadedPath,
      enabled,
    })
    if (error) throw new Error(`Não foi possível cadastrar o patch: ${error.message}`)
    $('importPatchDialog').close()
    showFlash(`${name} importado com sucesso.`, patchFlash)
    await loadPatches()
  } catch (err) {
    if (uploadedPath) { try { await supabase.storage.from('patches-3105').remove([uploadedPath]) } catch {} }
    showFlash(err.message, patchFlash)
  } finally {
    button.disabled = false
    progress.classList.add('hidden')
  }
})

$('editPatchForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const patchID = $('editPatchId').value
  const patch = allPatches.find(p => p.id === patchID)
  if (!patch) return
  const name = $('editPatchName').value.trim()
  const description = $('editPatchDescription').value.trim()
  const file = $('editPatchFile').files?.[0] || null
  const button = $('savePatchEdit')
  const progress = $('editPatchProgress')

  button.disabled = true
  progress.classList.remove('hidden')
  progress.textContent = file ? 'Enviando a nova versão do arquivo…' : 'Salvando nome e descrição…'
  try {
    if (!name) throw new Error('O nome do patch não pode ficar vazio.')
    if (file) {
      validatePatchFile(file)
      const newPath = await replacePatchFile(patch, file)
      $('editPatchCurrentPath').textContent = newPath
    }
    await setPatchMetadata(patchID, { name, description })
    $('editPatchDialog').close()
    showFlash(`${name} atualizado.`, patchFlash)
    await loadPatches()
  } catch (err) {
    showFlash(err.message, patchFlash)
  } finally {
    button.disabled = false
    progress.classList.add('hidden')
  }
})

patchList.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-patch-action]')
  if (!btn) return
  const id = btn.dataset.id
  const action = btn.dataset.patchAction
  const patch = allPatches.find(p => p.id === id)
  if (!patch) return

  if (action === 'edit') {
    $('editPatchId').value = patch.id
    $('editPatchTitle').textContent = patch.name || 'Patch'
    $('editPatchName').value = patch.name || ''
    $('editPatchDescription').value = patch.description || ''
    $('editPatchCurrentPath').textContent = patch.storage_path || '—'
    $('editPatchFile').value = ''
    $('editPatchProgress').classList.add('hidden')
    $('editPatchDialog').showModal()
    return
  }

  if (action !== 'toggle') return
  const enabled = btn.dataset.enabled === 'true'
  if (!enabled && !confirm(`Desativar ${patch.name || 'este patch'}?`)) return
  btn.disabled = true
  try {
    await patchApi({ action: 'set_enabled', patch_id: id, enabled })
    showFlash(`${patch.name || 'Patch'} ${enabled ? 'ativado' : 'desativado'}.`, patchFlash)
    await loadPatches()
  } catch (err) { showFlash(err.message, patchFlash) }
  finally { btn.disabled = false }
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
    const normalizedKey = key.trim().toUpperCase()
    exactLicense = { ...data.license, license_key: data.license.license_key || normalizedKey }
    rememberKey(data.license.id, normalizedKey)
    render([exactLicense])
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
    const newKey = data.created.license_key
    $('createdKey').textContent = newKey
    $('resultDialog').showModal()
    $('createNote').value = ''
    try {
      const found = await api({ action: 'search', key: newKey })
      if (found?.found && found.license?.id) rememberKey(found.license.id, newKey)
    } catch {}
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

$('deleteExpiredButton').addEventListener('click', async () => {
  const expired = allLicenses.filter(l => l.status === 'expired')
  if (!expired.length) {
    showFlash('Não há keys expiradas para excluir.')
    return
  }

  const ok = confirm(`Excluir permanentemente ${expired.length} key(s) expirada(s)? Essa ação não pode ser desfeita.`)
  if (!ok) return

  const button = $('deleteExpiredButton')
  button.disabled = true
  button.textContent = 'Excluindo…'
  try {
    const data = await api({ action: 'delete_expired' })
    for (const l of expired) delete knownKeys[l.id]
    localStorage.setItem(KNOWN_KEYS_STORAGE, JSON.stringify(knownKeys))
    showFlash(`${Number(data.deleted) || 0} key(s) expirada(s) excluída(s).`)
    await loadDashboard()
  } catch (e) {
    showFlash(e.message)
  } finally {
    button.disabled = false
    button.textContent = 'Excluir expiradas'
  }
})

$('expireRevokedButton').addEventListener('click', async () => {
  const revoked = allLicenses.filter(l => l.status === 'revoked')
  if (!revoked.length) {
    showFlash('Não há keys desativadas para expirar.')
    return
  }

  const ok = confirm(`Expirar agora ${revoked.length} key(s) desativada(s)? Elas irão para a categoria Expiradas.`)
  if (!ok) return

  const button = $('expireRevokedButton')
  button.disabled = true
  button.textContent = 'Expirando…'
  try {
    const data = await api({ action: 'expire_revoked' })
    showFlash(`${Number(data.expired) || 0} key(s) desativada(s) foram expiradas.`)
    await loadDashboard()
  } catch (e) {
    showFlash(e.message)
  } finally {
    button.disabled = false
    button.textContent = 'Expirar desativadas'
  }
})

licenseList.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]')
  if (!btn) return
  const id = btn.dataset.id
  const action = btn.dataset.action
  const l = exactLicense?.id === id ? exactLicense : allLicenses.find(x => x.id === id)

  try {
    btn.disabled = true
    if (action === 'copy-key') {
      let key = l?.license_key || knownKeys[id]
      if (!key) {
        const pasted = prompt('Esta é uma key antiga e o banco só possui o hash. Cole a key original uma vez para cadastrá-la e copiar:')
        if (!pasted) return
        const found = await api({ action: 'search', key: pasted })
        if (!found?.found || found.license?.id !== id) {
          showFlash('A key informada não corresponde a esta licença.')
          return
        }
        key = found.license.license_key || pasted.trim().toUpperCase()
        rememberKey(id, key)
        if (l) l.license_key = key
      }
      await navigator.clipboard.writeText(key)
      showFlash('Key copiada.')
      render(exactLicense ? [exactLicense] : allLicenses)
      return
    } else if (action === 'revoke') {
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
    activePanel = 'keys'
    keysPanel.classList.remove('hidden')
    patchesPanel.classList.add('hidden')
    $('tabKeys').classList.add('active')
    $('tabPatches').classList.remove('active')
    $('pageTitle').textContent = 'Licenças'
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

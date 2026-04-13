/* ============================================
   BYROEXC — Settings Page
   ============================================ */

const SettingsPage = (() => {

  function render() {
    return `
      <div class="stagger-children" style="max-width: 800px;">
        <!-- Profile Section -->
        <div class="card hover-lift mb-xl">
          <div class="card__header">
            <div class="card__title">Profile</div>
          </div>
          <div class="card__body">
            <div class="flex items-center gap-xl mb-xl">
              <div style="width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg, var(--accent-purple), var(--accent-pink)); display:flex; align-items:center; justify-content:center; font-size:var(--fs-xl); font-weight:700; color:white; flex-shrink:0;">
                B
              </div>
              <div style="flex:1">
                <div style="font-size: var(--fs-lg); font-weight: 700;">BYROEXC User</div>
                <div class="text-muted">user@byroexc.com</div>
                <div class="flex gap-sm mt-md">
                  <span class="badge badge--success">Verified</span>
                  <span class="badge" style="background: rgba(240,185,11,0.12); color:#f0b90b;">VIP Level 3</span>
                </div>
              </div>
              <button class="btn btn--secondary">Edit Profile</button>
            </div>
            <div class="grid grid-2" style="gap: var(--space-lg);">
              <div class="input-group">
                <label>Full Name</label>
                <input type="text" class="input" value="BYROEXC User">
              </div>
              <div class="input-group">
                <label>Email</label>
                <input type="email" class="input" value="user@byroexc.com">
              </div>
              <div class="input-group">
                <label>Phone</label>
                <input type="tel" class="input" value="+1 (555) 123-4567">
              </div>
              <div class="input-group">
                <label>Country</label>
                <select class="input">
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option selected>Romania</option>
                  <option>Germany</option>
                  <option>France</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Section -->
        <div class="card hover-lift mb-xl">
          <div class="card__header">
            <div class="card__title">Security</div>
          </div>
          <div class="card__body">
            ${renderSecurityRow('Two-Factor Authentication', 'Add an extra layer of security', true, 'shield')}
            ${renderSecurityRow('Biometric Login', 'Use fingerprint or face recognition', false, 'fingerprint')}
            ${renderSecurityRow('Anti-Phishing Code', 'Set a code to identify genuine BYROEXC emails', true, 'mail')}
            ${renderSecurityRow('Withdrawal Whitelist', 'Only allow withdrawals to whitelisted addresses', false, 'list')}
            <div style="margin-top: var(--space-lg); padding-top: var(--space-lg); border-top: 1px solid var(--border-primary);">
              <button class="btn btn--secondary">Change Password</button>
            </div>
          </div>
        </div>

        <!-- Preferences Section -->
        <div class="card hover-lift mb-xl">
          <div class="card__header">
            <div class="card__title">Preferences</div>
          </div>
          <div class="card__body">
            <div class="flex items-center justify-between mb-lg" style="padding: var(--space-md) 0;">
              <div>
                <div style="font-weight: 600;">Currency</div>
                <div class="text-sm text-muted">Display prices in your preferred currency</div>
              </div>
              <select class="input" style="width: 140px;">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>RON (lei)</option>
              </select>
            </div>
            <div class="flex items-center justify-between mb-lg" style="padding: var(--space-md) 0; border-top: 1px solid var(--border-primary);">
              <div>
                <div style="font-weight: 600;">Theme</div>
                <div class="text-sm text-muted">Choose your interface theme</div>
              </div>
              <div class="tabs">
                <div class="tab active">Dark</div>
                <div class="tab">Midnight</div>
                <div class="tab">Light</div>
              </div>
            </div>
            <div class="flex items-center justify-between" style="padding: var(--space-md) 0; border-top: 1px solid var(--border-primary);">
              <div>
                <div style="font-weight: 600;">Language</div>
                <div class="text-sm text-muted">Set your preferred language</div>
              </div>
              <select class="input" style="width: 140px;">
                <option>English</option>
                <option>Français</option>
                <option>Deutsch</option>
                <option>Español</option>
                <option>Română</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Notifications Section -->
        <div class="card hover-lift mb-xl">
          <div class="card__header">
            <div class="card__title">Notifications</div>
          </div>
          <div class="card__body">
            ${renderToggleRow('Price Alerts', 'Get notified when a coin reaches your target price', true)}
            ${renderToggleRow('Trade Confirmations', 'Receive email confirmations for trades', true)}
            ${renderToggleRow('Login Alerts', 'Get notified of new login activity', true)}
            ${renderToggleRow('Marketing Emails', 'Receive promotional emails and updates', false)}
            ${renderToggleRow('Push Notifications', 'Enable browser push notifications', false)}
          </div>
        </div>

        <!-- API Section -->
        <div class="card hover-lift">
          <div class="card__header">
            <div class="card__title">API Management</div>
          </div>
          <div class="card__body">
            <div class="text-muted mb-lg">Manage API keys for algorithmic trading and third-party integrations.</div>
            <button class="btn btn--primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
              Create New API Key
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderSecurityRow(title, description, enabled, icon) {
    return `
      <div class="flex items-center justify-between" style="padding: var(--space-md) 0; border-bottom: 1px solid var(--border-primary);">
        <div class="flex items-center gap-lg">
          <div style="width:40px; height:40px; border-radius:var(--radius-md); background:rgba(var(--accent-primary-rgb), 0.1); display:flex; align-items:center; justify-content:center; color:var(--accent-primary);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div style="font-weight: 600;">${title}</div>
            <div class="text-sm text-muted">${description}</div>
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox" ${enabled ? 'checked' : ''}>
          <span class="toggle__slider"></span>
        </label>
      </div>
    `;
  }

  function renderToggleRow(title, description, enabled) {
    return `
      <div class="flex items-center justify-between" style="padding: var(--space-md) 0; border-bottom: 1px solid var(--border-primary);">
        <div>
          <div style="font-weight: 600;">${title}</div>
          <div class="text-sm text-muted">${description}</div>
        </div>
        <label class="toggle">
          <input type="checkbox" ${enabled ? 'checked' : ''}>
          <span class="toggle__slider"></span>
        </label>
      </div>
    `;
  }

  function afterRender() {}
  function onUpdate() {}

  return { render, afterRender, onUpdate };
})();

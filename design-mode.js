window.theme = window.theme || {};
window.theme.ARCHETYPE_ADMIN_HOST = 'https://api.archetypethemes.co/'

class ArchetypeAnalytics {
  payload = {}

  editorData = {
    name: 'ArchetypeAnalytics@v1.1.0',
    session: this.session || null,
    shop: window.Shopify.shop,
    shopEmail: window.theme && window.theme.settings && window.theme.settings.email,
    shopId: window.BOOMR && window.BOOMR.shopId,
    themeName: window.theme && window.theme.settings && `${window.theme.settings.themeName} v${window.theme.settings.themeVersion}`,
    role: window.Shopify.theme.role,
    route: window.location.pathname,
    themeId: window.Shopify.theme.id,
    themeStoreId: window.Shopify.theme.theme_store_id || 0,
    cookie: document.cookie,
  }

  constructor() {
    this.lastSentJSON = '';
    document.addEventListener("visibilitychange", () => this.sendData());
  }

  get session() {
    const key = 'ARCHETYPE_ANALYTICS_SESSION'
    const session = sessionStorage.getItem(key)

    if (session) {
      return session
    } else {
      const id = this.uuidv4();
      sessionStorage.setItem(key, id)
      return id
    }
  }

  uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  log(event, value) {
    this.payload[event] = value;
  }

  getLog(event) {
    return this.payload[event];
  }

  set sendDate(date) {
    const key = 'ARCHETYPE_ANALYTICS_SENT_DATE';
    const currentDate = date.toISOString();
    localStorage.setItem(key, currentDate);
  }

  get sendDate() {
    const key = 'ARCHETYPE_ANALYTICS_SENT_DATE'
    const sendDateValue = localStorage.getItem(key)

    if (!sendDateValue) return;

    return new Date(sendDateValue)
  }

  get sentToday() {    
    const todayDate = new Date()

    if (!this.sendDate) return false;

    return this.sendDate.toDateString() === todayDate.toDateString();
  }

  sendData() {
    const json = JSON.stringify(Object.assign(this.editorData, {
      cookie: document.cookie, 
      payload: this.payload 
    }))

    // if (document.visibilityState === "hidden" && this.lastSentJSON !== json) {
    if (document.visibilityState === "hidden" && !this.sentToday) {
      const blob = new Blob([json],{ type: 'application/json; charset=UTF-8' });
      navigator.sendBeacon(`${window.theme.ARCHETYPE_ADMIN_HOST}api/analytics`, blob);
      this.sendDate = new Date();
      // this.lastSentJSON = json;
    }
  }
}

window.theme.editorAnalytics = window.theme.editorAnalytics || new ArchetypeAnalytics();

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { pathToFileURL, fileURLToPath } = require('node:url');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
function shell({ width = 1366, saved = 'false', blocked = false } = {}) {
    let document;
    function node() {
        const classes = new Set(), attrs = {}, events = {};
        return { style: {}, dataset: {}, attrs, events, textContent: 'Navegação', innerHTML: '', inert: false,
            classList: { contains: c => classes.has(c), add: c => classes.add(c), remove: c => classes.delete(c), toggle(c, force) { const value = force ?? !classes.has(c); value ? classes.add(c) : classes.delete(c); return value; } },
            setAttribute(k,v) { attrs[k] = String(v); }, getAttribute: k => attrs[k] ?? null, removeAttribute(k) { delete attrs[k]; },
            addEventListener(k,fn) { (events[k] ||= []).push(fn); },
            querySelector() { return null; }, querySelectorAll() { return []; },
            appendChild() {}, getClientRects: () => [{}], getBoundingClientRect: () => ({ right: 68, top: 240 }),
            focus() { document.activeElement = this; }
        };
    }
    const ids = Object.fromEntries(['sidebar', 'sidebarToggle', 'mobileMenuToggle', 'mobileOverlay', 'themeToggle', 'themeToggleMobile'].map(id => [id,node()]));
    const main = node(), link = node(), footer = node(), nav = node(), first = ids.sidebarToggle, last = node();
    link.parentElement = node();
    ids.sidebar.querySelector = selector => selector === '.nav-footer' ? footer : selector === '.sidebar-nav' ? nav : null;
    ids.sidebar.querySelectorAll = selector => selector.startsWith('button') ? [first,last] : [link];
    const media = { matches: width <= 1024, events: [], addEventListener(_,fn) { this.events.push(fn); } };
    document = { getElementById: id => ids[id] || null, querySelector: selector => selector === '.main-content' ? main : null,
        querySelectorAll: selector => selector === '.nav-link' ? [link] : [], documentElement: node(), body: node(),
        addEventListener(k,fn) { (this.events[k] ||= []).push(fn); }, events: {}, createElement: node, activeElement: ids.mobileMenuToggle, readyState: 'loading' };
    document.body.style.overflow = 'auto';
    const storage = new Map([['sidebarCollapsed',saved]]);
    const window = { matchMedia: () => media, innerWidth: width, innerHeight: 768, location: new URL('https://local.test/Unicheck/platform/index-interno.html'), addEventListener() {} };
    const context = vm.createContext({ window, document, console, URL, setTimeout() {}, clearTimeout() {},
        localStorage: { getItem(k) { if(blocked)throw Error('blocked'); return storage.get(k); }, setItem(k,v) { if(blocked)throw Error('blocked'); storage.set(k,v); } }
    });
    vm.runInContext(read('Unicheck/platform/shared/js/platform-shell.js'),context);
    context.initializeSidebarAccessibility();
    return { context, ids, document, main, media, storage, link, footer, first, last };
}

test('desktop usa controle de painel, mantém símbolo e sincroniza estado acessível com persistência', () => {
    const {context, ids, main, storage} = shell();
    assert.equal(ids.sidebarToggle.attrs['aria-expanded'],'true');
    assert.match(ids.sidebarToggle.innerHTML,/panel-left-close/);
    context.toggleSidebar();
    assert.equal(ids.sidebar.classList.contains('collapsed'),true);
    assert.equal(main.classList.contains('expanded'),true);
    assert.equal(ids.sidebarToggle.attrs['aria-expanded'],'false');
    assert.equal(ids.sidebarToggle.attrs['aria-label'],'Expandir navegação');
    assert.equal(storage.get('sidebarCollapsed'),'true');
    assert.match(ids.sidebarToggle.innerHTML,/panel-left-open/);
    assert.doesNotMatch(ids.sidebarToggle.innerHTML,/hamburger|data-lucide="menu"/);
    const nextPage = shell({saved:storage.get('sidebarCollapsed')});
    assert.equal(nextPage.ids.sidebar.classList.contains('collapsed'),true);
    nextPage.context.toggleSidebar();
    assert.equal(nextPage.storage.get('sidebarCollapsed'),'false');
});

test('storage bloqueado não impede recolher, expandir ou abrir drawer', () => {
    const {context,ids} = shell({blocked:true});
    assert.doesNotThrow(() => context.toggleSidebar());
    assert.equal(ids.sidebar.classList.contains('collapsed'),true);
    assert.doesNotThrow(() => context.toggleSidebar());
    assert.equal(ids.sidebar.classList.contains('collapsed'),false);
});

test('drawer controla foco, Escape, overlay, inert e restaura scroll anterior', () => {
    const {context,ids,main,document,first,last} = shell({width:390,saved:'true'});
    assert.equal(ids.sidebar.inert,true);
    assert.equal(ids.sidebar.classList.contains('collapsed'),false);
    context.toggleMobileMenu();
    assert.equal(ids.sidebar.attrs['aria-modal'],'true');
    assert.equal(ids.mobileMenuToggle.attrs['aria-expanded'],'true');
    assert.equal(main.inert,true);
    assert.equal(document.body.style.overflow,'hidden');
    assert.equal(document.activeElement,first);
    const key = event => document.events.keydown.forEach(fn => fn({preventDefault(){},...event}));
    key({key:'Tab',shiftKey:true}); assert.equal(document.activeElement,last);
    key({key:'Tab',shiftKey:false}); assert.equal(document.activeElement,first);
    key({key:'Escape'});
    assert.equal(main.inert,false);
    assert.equal(ids.sidebar.inert,true);
    assert.equal(document.body.style.overflow,'auto');
    assert.equal(document.activeElement,ids.mobileMenuToggle);
    assert.equal(ids.mobileOverlay.classList.contains('active'),false);
    assert.equal(ids.mobileMenuToggle.attrs['aria-expanded'],'false');
});

test('navegar em mobile fecha uma vez e resize preserva preferência desktop', () => {
    const {context,ids,media,storage,link,main} = shell({width:768,saved:'true'});
    context.closeMobileMenuOnLinkClick();
    context.toggleMobileMenu();
    link.events.click.forEach(fn=>fn());
    assert.equal(ids.sidebar.classList.contains('open'),false);
    context.toggleMobileMenu();
    media.matches=false; media.events.forEach(fn=>fn());
    assert.equal(main.inert,false);
    assert.equal(ids.sidebar.inert,false);
    assert.equal(ids.sidebar.classList.contains('open'),false);
    assert.equal(ids.sidebar.classList.contains('collapsed'),true);
    assert.equal(storage.get('sidebarCollapsed'),'true');
});

for (const width of [1920,1600,1440,1366,1280,1024,768,390]) {
    test(`shell seleciona semântica correta em ${width}px (sem motor de layout)`, () => {
        const {ids} = shell({width,saved:'true'});
        assert.equal(ids.sidebar.classList.contains('collapsed'),width > 1024);
        assert.equal(ids.sidebar.inert,width <= 1024);
        assert.match(ids.sidebarToggle.innerHTML,width <= 1024 ? /data-lucide="x"/ : /panel-left-open/);
    });
}

test('seis páginas carregam o shell; cinco usam sidebar global e mantêm seus destinos', () => {
    const platform = path.join(root,'Unicheck/platform');
    const files = [path.join(platform,'index-interno.html'), ...fs.readdirSync(path.join(platform,'pages')).map(dir=>path.join(platform,'pages',dir,`${dir}.html`))].filter(fs.existsSync);
    assert.equal(files.length,6);
    for(const file of files) {
        const html=fs.readFileSync(file,'utf8');
        assert.match(html,/platform-shell\.js/);
        if(file.includes('configuracoes-perfil')) { assert.match(html,/profile-sidebar/); continue; }
        assert.match(html,/sidebar-preference\.js/);
        const sidebar=html.split('<aside class="sidebar"')[1].split('</aside>')[0];
        const links=[...sidebar.matchAll(/<a href="([^"]+)" class="nav-link"/g)];
        assert.equal(links.length,5,file);
        for(const [,href] of links)assert.ok(fs.existsSync(fileURLToPath(new URL(href,pathToFileURL(file)))),`${file}: ${href}`);
    }
});

test('active state segue o endereço real no Manual, Ajuda e Dashboard', () => {
    const {context,link} = shell();
    for(const page of ['manual-aluno/manual-aluno.html','ajuda-suporte/ajuda-suporte.html','checklist-academico/checklist-academico.html','beneficios-estudantis/beneficios-estudantis.html']) {
        context.window.location = new URL(`https://local.test/Unicheck/platform/pages/${page}`);
        link.setAttribute('href',context.window.location.href);
        context.setupMenuActiveState();
        assert.equal(link.attrs['aria-current'],'page');
        link.setAttribute('href','https://local.test/Unicheck/platform/index-interno.html');
        context.setupMenuActiveState();
        assert.equal(link.attrs['aria-current'],undefined);
        assert.equal(link.parentElement.classList.contains('active'),false);
    }
    context.window.location = new URL('https://local.test/Unicheck/platform/index-interno.html');
    link.setAttribute('href','#');
    context.setupMenuActiveState();
    assert.equal(link.attrs['aria-current'],'page');
});

test('tema atualiza a ação acessível nos dois sentidos', () => {
    const {context,ids,document} = shell();
    document.documentElement.setAttribute('data-theme','light');
    context.toggleTheme();
    assert.equal(document.documentElement.attrs['data-theme'],'dark');
    assert.equal(ids.themeToggle.attrs['aria-label'],'Usar tema claro');
    context.toggleTheme();
    assert.equal(document.documentElement.attrs['data-theme'],'light');
    assert.equal(ids.themeToggle.attrs['aria-label'],'Usar tema escuro');
});

test('bootstrap aplica preferência antes da inicialização e ignora rail em mobile', () => {
    for(const width of [1366,390]) {
        const {context,document} = shell({width,saved:'true'});
        document.documentElement.classList.remove('sidebar-is-collapsed');
        vm.runInContext(read('Unicheck/platform/shared/js/sidebar-preference.js'),context);
        assert.equal(document.documentElement.classList.contains('sidebar-is-collapsed'),width > 1024);
    }
});

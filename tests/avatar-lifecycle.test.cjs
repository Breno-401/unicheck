const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const read = name => fs.readFileSync(path.join(__dirname, '..', 'Unicheck', name), 'utf8');
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const flush = async () => { for (let i=0;i<12;i++) await Promise.resolve(); };
const storage = () => { const map = new Map(); return { getItem: k => map.get(k) ?? null, setItem: (k,v) => map.set(k,String(v)), removeItem: k => map.delete(k), get length(){return map.size;}, key: i => [...map.keys()][i] }; };
const photo = (url='https://example.test/avatar.webp?v=1', id='u1') => ({id,nome:'Breno Clemente',email:'breno@example.test',foto_url:url,avatarImage:url,avatarText:'BC'});
function setup({cached=photo(), sharedLocal, sharedSession, sessionPromise, service=false, auth=false}={}) {
 const localStorage=sharedLocal||storage(), sessionStorage=sharedSession||storage();
 if(cached) localStorage.setItem('userProfile',JSON.stringify(cached));
 const listeners=new Map(), images=[], nodes=new Map(), reads=[], events=[];
 const node=()=>({style:{},attrs:{},textContent:'',setAttribute(k,v){this.attrs[k]=v;},querySelector(){return this.span||(this.span={style:{},textContent:''});}});
 const getNode=s=>{if(!nodes.has(s))nodes.set(s,node());return nodes.get(s);};
 const user={id:'u1',email:'breno@example.test',user_metadata:{full_name:'Breno Clemente',photo_url:'https://example.test/WRONG.webp'}};
 let authCallback;
 const query={select(){return this;},eq(){return this;},maybeSingle(){const d=deferred();reads.push(d);return d.promise;},update(p){this.payload=p;return this;},single:async function(){return {data:{...this.payload,email:user.email},error:null};}};
 const window={location:{origin:'https://example.test',pathname:'/Unicheck/platform/index-interno.html'},
  addEventListener(k,fn){if(!listeners.has(k))listeners.set(k,[]);listeners.get(k).push(fn);},
  dispatchEvent(e){events.push(e);for(const fn of listeners.get(e.type)||[])fn(e);},
  UniCheckAuth:{getSession:()=>sessionPromise||Promise.resolve({user})},
  UniCheckProfile:{getMyProfile:async()=>null},
  UniCheckSupabase:{client:{from:()=>query,auth:{getSession:async()=>({data:{session:{user}}}),updateUser:async()=>({data:{user}}),onAuthStateChange:fn=>{authCallback=fn;return {};}}}}
 };
 const context=vm.createContext({window,localStorage,sessionStorage,URL,console:{info(){},warn(){},error(){}},setTimeout,
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
  document:{readyState:'complete',querySelector:getNode,querySelectorAll:s=>[getNode(s)],addEventListener(){}},
  Image:class{constructor(){images.push(this);}set src(v){this.url=v;}}
 });
 vm.runInContext(read('js/core/validation.js'),context);
 if(auth)vm.runInContext(read('js/core/auth.js'),context);
 if(service)vm.runInContext(read('js/services/profile.js'),context);
 const mount=()=>vm.runInContext(read('platform/shared/js/profile-sync.js'),context);
 const emit=(type,detail)=>window.dispatchEvent({type,detail});
 return {window,localStorage,sessionStorage,images,nodes,reads,events,context,mount,emit,user,query,authEvent:(event,session={user})=>authCallback(event,session),avatar:()=>getNode('.user-profile .user-avatar')};
}
test('avatar existente carrega uma vez e todos os pontos do shell usam a mesma URL',async()=>{
 const h=setup();h.mount();await flush();assert.equal(h.images.length,1);h.images[0].onload();
 for(const s of ['.user-profile .user-avatar','.user-avatar-small','.user-dropdown-avatar']){assert.match(h.nodes.get(s).style.backgroundImage,/avatar.webp/);assert.equal(h.nodes.get(s).querySelector().style.opacity,'0');}
 await h.window.ProfileManager.sync();assert.equal(h.images.length,1);
});
test('sem avatar confirmado mostra iniciais e não tenta baixar imagem',async()=>{const h=setup({cached:photo(null)});h.mount();await flush();assert.equal(h.images.length,0);assert.equal(h.avatar().querySelector().style.opacity,'1');assert.equal(h.avatar().querySelector().textContent,'BC');});
test('carregamento atrasado e restauração da sessão não exibem fallback como ausência',async()=>{const d=deferred(),h=setup({sessionPromise:d.promise});h.mount();await flush();assert.equal(h.avatar().querySelector().style.opacity,'0');d.resolve({user:h.user});await flush();assert.equal(h.avatar().querySelector().style.opacity,'0');h.images[0].onload();assert.match(h.avatar().style.backgroundImage,/avatar/);});
test('erro real de imagem sem foto anterior revela fallback',async()=>{const h=setup();h.mount();await flush();h.images[0].onerror();assert.equal(h.avatar().style.backgroundImage,'');assert.equal(h.avatar().querySelector().style.opacity,'1');});
test('URL inválida confirmada usa fallback sem carregar Blob ou javascript',async()=>{for(const url of ['blob:expired','javascript:alert(1)','not-a-url']){const h=setup({cached:photo(url)});h.mount();await flush();assert.equal(h.images.length,0);assert.equal(h.avatar().querySelector().style.opacity,'1');}});
test('nova imagem atrasada ou com erro mantém a última válida; callback antigo é ignorado',async()=>{const h=setup();h.mount();await flush();h.images[0].onload();const old=h.avatar().style.backgroundImage;h.emit('unicheck:profile-updated',{profile:photo('https://example.test/new.webp')});assert.equal(h.avatar().style.backgroundImage,old);h.images[1].onerror();assert.equal(h.avatar().style.backgroundImage,old);h.emit('unicheck:profile-updated',{profile:photo('https://example.test/newer.webp')});h.images[2].onload();h.images[0].onerror();assert.match(h.avatar().style.backgroundImage,/newer/);});
test('navegação entre páginas reaproveita URL validada na sessão sem flicker',async()=>{const a=setup();a.mount();await flush();a.images[0].onload();const b=setup({sharedLocal:a.localStorage,sharedSession:a.sessionStorage});b.mount();await flush();assert.match(b.avatar().style.backgroundImage,/avatar/);assert.equal(b.avatar().querySelector().style.opacity,'0');});
test('focus e visibilitychange não recarregam nem limpam; pageshow conserva a imagem',async()=>{const h=setup();h.mount();await flush();h.images[0].onload();for(const type of ['focus','visibilitychange','pageshow']){h.emit(type);await flush();assert.match(h.avatar().style.backgroundImage,/avatar/);}assert.equal(h.images.length,1);});
test('rail e sidebar expandida reaplicam a mesma foto sem listener duplicado',async()=>{const h=setup();h.mount();await flush();h.images[0].onload();h.mount();h.window.ProfileManager.bindAutoSync();for(const collapsed of [true,false,true]){h.avatar().setAttribute('data-test-collapsed',String(collapsed));await h.window.ProfileManager.sync();assert.match(h.avatar().style.backgroundImage,/avatar/);}assert.equal(h.images.length,1);});
test('remoção explícita e logout invalidam a última foto e seus callbacks',async()=>{const h=setup();h.mount();await flush();h.images[0].onload();h.emit('unicheck:profile-updated',{profile:photo(null)});assert.equal(h.avatar().style.backgroundImage,'');h.images[0].onload();assert.equal(h.avatar().style.backgroundImage,'');h.emit('unicheck:session-changed',{signedOut:true,userId:null});assert.equal(h.sessionStorage.getItem('unicheck:avatar-ready'),null);});
test('cache de outra conta nunca é mostrado após validar a sessão',async()=>{const h=setup({cached:photo('https://example.test/other.webp','u2')});h.mount();await flush();assert.equal(h.images.length,0);assert.equal(h.avatar().style.backgroundImage,'');});
test('Auth não troca foto da tabela por metadata durante SIGNED_IN e TOKEN_REFRESHED',()=>{const h=setup({auth:true});for(const event of ['INITIAL_SESSION','SIGNED_IN','TOKEN_REFRESHED','USER_UPDATED']){h.authEvent(event);assert.equal(JSON.parse(h.localStorage.getItem('userProfile')).foto_url,photo().foto_url);}h.authEvent('INITIAL_SESSION',null);assert.equal(JSON.parse(h.localStorage.getItem('userProfile')).foto_url,photo().foto_url);});
test('Auth de outra conta invalida cache e usa perfil pendente sem foto de metadata',()=>{const h=setup({auth:true});h.authEvent('SIGNED_IN',{user:{...h.user,id:'u2'}});const p=JSON.parse(h.localStorage.getItem('userProfile'));assert.equal(p.id,'u2');assert.equal(p.profilePending,true);assert.equal(p.foto_url,undefined);});
test('resposta antiga do perfil não sobrescreve edição mais nova nem o cache',async()=>{const h=setup({service:true});const pending=h.window.UniCheckProfile.getMyProfile();await flush();assert.equal(h.reads.length,1);await h.window.UniCheckProfile.updateMyProfile({nome:'Breno Clemente',email:h.user.email,ra:'',foto_url:'https://example.test/new.webp'});h.reads[0].resolve({data:{nome:'Breno Clemente',email:h.user.email,foto_url:null},error:null});await pending;assert.match(JSON.parse(h.localStorage.getItem('userProfile')).foto_url,/new/);assert.match((await h.window.UniCheckProfile.getMyProfile()).foto_url,/new/);});
test('falha remota mantém cache da mesma conta sem publicar avatar nulo',async()=>{const h=setup({service:true});const pending=h.window.UniCheckProfile.getMyProfile();await flush();h.reads[0].resolve({data:null,error:{message:'network failure'}});assert.equal((await pending).foto_url,photo().foto_url);assert.equal(h.events.filter(e=>e.type==='unicheck:profile-updated').length,0);});
test('logout invalida leitura remota pendente antes de ela poder repovoar cache',async()=>{const h=setup({service:true,auth:true});const pending=h.window.UniCheckProfile.getMyProfile();await flush();h.authEvent('SIGNED_OUT',null);h.reads[0].resolve({data:photo(),error:null});assert.equal(await pending,null);assert.equal(h.localStorage.getItem('userProfile'),null);});
test('storage bloqueado não descarta perfil remoto válido',async()=>{const h=setup({service:true});h.localStorage.setItem=()=>{throw Error('blocked');};const pending=h.window.UniCheckProfile.getMyProfile();await flush();h.reads[0].resolve({data:photo(),error:null});assert.equal((await pending).foto_url,photo().foto_url);});

test('leitura iniciada durante atualização aguarda o perfil salvo em vez de buscar dados antigos', async () => {
 const h=setup({service:true});const d=deferred();h.window.UniCheckSupabase.client.auth.updateUser=()=>d.promise;
 const update=h.window.UniCheckProfile.updateMyProfile({nome:'Breno Clemente',email:h.user.email,ra:'',foto_url:'https://example.test/new.webp'});await flush();
 const reading=h.window.UniCheckProfile.getMyProfile();await flush();assert.equal(h.reads.length,0);
 d.resolve({data:{user:h.user}});assert.match((await update).foto_url,/new/);assert.match((await reading).foto_url,/new/);
});

test('mudança de storage invalida a leitura antiga e o cache em memória', async () => {
 const h=setup({service:true});const reading=h.window.UniCheckProfile.getMyProfile();await flush();
 h.localStorage.setItem('userProfile',JSON.stringify(photo('https://example.test/other-tab.webp')));
 h.window.dispatchEvent({type:'storage',key:'userProfile'});
 h.reads[0].resolve({data:photo(null),error:null});assert.match((await reading).foto_url,/other-tab/);
 assert.match((await h.window.UniCheckProfile.getMyProfile()).foto_url,/other-tab/);
});

test('avatar salvo de configurações usa o controlador compartilhado; preview local fica isolado',async()=>{
 const h=setup();h.mount();await flush();h.images[0].onload();const settings=h.nodes.get('#profile-avatar');assert.match(settings.style.backgroundImage,/avatar/);
 settings.dataset={avatarPreview:'true'};settings.style.backgroundImage='url("blob:preview-local")';h.emit('unicheck:profile-updated',{profile:photo('https://example.test/new.webp')});h.images[1].onload();assert.match(settings.style.backgroundImage,/blob:preview-local/);
 settings.dataset.avatarPreview='false';h.window.ProfileManager.refreshAvatar();assert.match(settings.style.backgroundImage,/new.webp/);assert.equal(h.images.length,2);
});

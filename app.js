/* Portfolio records support any mixture of {type:'image',src,alt} and
   {type:'video',src,poster,alt}. MP4/WebM are native and never autoplay. */
const works=[
 {id:'clutch',category:'clutch',title:'Замена сцепления на площадке',vehicle:'Европейский тягач · МКПП ZF',location:'Площадка в Московской области',problem:'Передачи включались с трудом, педаль сцепления проваливалась.',solution:'Диагностика привода, замена комплекта сцепления и проверка работы ПГУ.',result:'Пример описания результата: сцепление работает, передачи включаются штатно.',media:[{type:'image',src:'assets/clutch.jpg',alt:'Сцепление при выездном ремонте'},{type:'image',src:'assets/hero.jpg',alt:'Общий вид ремонта тягача'}]},
 {id:'diagnostics',category:'electric',title:'Поиск причины ошибок на стоянке',vehicle:'Грузовой автомобиль',location:'Промышленная стоянка, Москва',problem:'На панели появились ошибки. Нужно было определить причину неисправности.',solution:'Подключение диагностики, проверка параметров и электрических соединений.',result:'Пример описания результата: найдена причина, согласован дальнейший ремонт.',media:[{type:'image',src:'assets/diagnostics.jpg',alt:'Диагностическое оборудование у грузовика'},{type:'image',src:'assets/hero.jpg',alt:'Работа механика у автомобиля'}]},
 {id:'trailer',category:'trailer',title:'Ремонт колёсного узла полуприцепа',vehicle:'Шторный полуприцеп',location:'Грузовая стоянка, Московская область',problem:'Обнаружена неисправность колёсного узла. Продолжать рейс без проверки нельзя.',solution:'Осмотр узла, необходимые ремонтные работы и проверка системы.',result:'Пример описания результата: узел отремонтирован и проверен перед эксплуатацией.',media:[{type:'image',src:'assets/trailer.jpg',alt:'Механик у оси полуприцепа'}]}
];

let activeCase=0,activePhoto=0,lastFocus=null;
const leadDialog=document.querySelector('#lead-dialog');
const videoDialog=document.querySelector('#video-dialog');
const mediaDialog=document.querySelector('#media-dialog');
function openDialog(d){lastFocus=document.activeElement;d.showModal();document.body.classList.add('locked')}
function closeDialog(d){d.querySelectorAll('video').forEach(v=>v.pause());d.close();document.body.classList.remove('locked');lastFocus?.focus()}
function lead(subject, estimate = false) {
  leadDialog.querySelector('#lead-title').textContent = estimate ? 'Расчёт стоимости' : subject;
  leadDialog.querySelector('.modal-copy > p').textContent = estimate
    ? `${subject}. Уточним детали и сориентируем по цене.`
    : 'Уточним поломку и согласуем выезд.';
  leadDialog.querySelector('[name=subject]').value = subject;
  leadDialog.querySelector('.form-status').textContent = '';
  openDialog(leadDialog);
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-lead]');
  if (trigger) lead(trigger.dataset.lead, trigger.hasAttribute('data-estimate'));
  const close = event.target.closest('[data-close]');
  if (close) closeDialog(close.closest('dialog'));
  if (event.target.closest('[data-info]')) openDialog(document.querySelector('#info-dialog'));
});
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('cancel',()=>{d.querySelectorAll('video').forEach(v=>v.pause());document.body.classList.remove('locked')});d.addEventListener('close',()=>document.body.classList.remove('locked'));d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d)})});
function photos(){return works[activeCase].media.filter(m=>m.type==='image')}
function renderCase(){const w=works[activeCase];activePhoto=0;['title','vehicle','location','problem','solution'].forEach(k=>document.querySelector('#portfolio-'+k).textContent=w[k]);document.querySelector('#case-position').textContent=(activeCase+1)+' / '+works.length;const dots=document.querySelector('#case-dots');dots.replaceChildren();works.forEach((w,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Работа '+(i+1)+': '+w.title);b.setAttribute('aria-pressed',String(i===activeCase));b.classList.toggle('active',i===activeCase);b.addEventListener('click',()=>{activeCase=i;renderCase()});dots.append(b)});renderPhoto()}
function renderPhoto(){const items=photos(),m=items[activePhoto];const img=document.querySelector('#portfolio-image');img.src=m.src;img.alt=m.alt;const thumbs=document.querySelector('#portfolio-thumbs');thumbs.replaceChildren();items.forEach((m,i)=>{const b=document.createElement('button');b.classList.toggle('selected',i===activePhoto);b.setAttribute('aria-pressed',String(i===activePhoto));b.setAttribute('aria-label','Фото '+(i+1));const image=document.createElement('img');image.src=m.src;image.alt='';b.append(image);b.addEventListener('click',()=>{activePhoto=i;renderPhoto()});thumbs.append(b)});if(mediaDialog.open)renderLargePhoto()}
document.querySelector('#prev-case').addEventListener('click',()=>{activeCase=(activeCase-1+works.length)%works.length;renderCase()});document.querySelector('#next-case').addEventListener('click',()=>{activeCase=(activeCase+1)%works.length;renderCase()});
document.querySelector('#similar-case').addEventListener('click',()=>lead(works[activeCase].title));
function renderLargePhoto(){const items=photos(),m=items[activePhoto];const stage=document.querySelector('#media-stage');const image=document.createElement('img');image.src=m.src;image.alt=m.alt;stage.replaceChildren(image);document.querySelector('#media-position').textContent=(activePhoto+1)+' / '+items.length;document.querySelector('#prev-media').disabled=items.length<2;document.querySelector('#next-media').disabled=items.length<2}
document.querySelector('#portfolio-main').addEventListener('click',()=>{renderLargePhoto();openDialog(mediaDialog)});
document.querySelector('#prev-media').addEventListener('click',()=>{activePhoto=(activePhoto-1+photos().length)%photos().length;renderPhoto()});document.querySelector('#next-media').addEventListener('click',()=>{activePhoto=(activePhoto+1)%photos().length;renderPhoto()});mediaDialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight')document.querySelector('#next-media').click();if(e.key==='ArrowLeft')document.querySelector('#prev-media').click()});
function showVideo(){const media=works[activeCase].media.find(m=>m.type==='video');const stage=document.querySelector('#video-stage');stage.querySelector('video')?.pause();stage.replaceChildren();document.querySelector('#video-empty').hidden=Boolean(media);document.querySelector('#video-title').textContent=works[activeCase].title;if(media){const v=document.createElement('video');v.src=media.src;v.controls=true;v.playsInline=true;v.preload='metadata';if(media.poster)v.poster=media.poster;v.setAttribute('aria-label','Видео: '+works[activeCase].title);v.addEventListener('error',()=>{stage.replaceChildren();const p=document.createElement('p');p.textContent='Не удалось воспроизвести видео. Используйте MP4 (H.264) или WebM.';stage.append(p);document.querySelector('#video-empty').hidden=false});stage.append(v)}}
document.querySelector('#portfolio-video').addEventListener('click',()=>{showVideo();openDialog(videoDialog)});let videoUrls=[];document.querySelector('#video-file').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;if(!['video/mp4','video/webm'].includes(f.type)){alert('Выберите MP4 или WebM.');return}const url=URL.createObjectURL(f);videoUrls.push(url);works[activeCase].media=works[activeCase].media.filter(m=>m.type!=='video');works[activeCase].media.push({type:'video',src:url});showVideo();e.target.value=''});window.addEventListener('beforeunload',()=>videoUrls.forEach(u=>URL.revokeObjectURL(u)));
document.querySelectorAll('[data-form]').forEach(f=>{const p=f.querySelector('[name=phone]');p.addEventListener('input',()=>p.setCustomValidity(''));f.addEventListener('submit',e=>{e.preventDefault();const n=p.value.replace(/\D/g,'');if(n.length<10||n.length>15){p.setCustomValidity('Введите номер телефона: от 10 до 15 цифр.');p.reportValidity();return}f.querySelector('.form-status').textContent='Демонстрация: данные не отправлены. Приём заявок ещё не подключён.';f.reset()})});
const menu=document.querySelector('.menu-toggle');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('.header nav').classList.toggle('open',open)});document.querySelectorAll('.header nav a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');document.querySelector('.header nav').classList.remove('open')}));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');const hero=document.querySelector('.hero'),track=document.querySelector('.hero-track'),bar=document.querySelector('.mobile-action');let scheduled=false;
const priceQuiz=document.querySelector('#price');
function scrollFrame(){
 scheduled=false;
 const r=track.getBoundingClientRect(),height=r.height;
 const quizBounds=priceQuiz.getBoundingClientRect();
 const quizInView=quizBounds.top<innerHeight&&quizBounds.bottom>0;
 const distance=Math.max(0,-r.top),progress=Math.min(1,distance/height);
 if(!reduced.matches){
  hero.style.setProperty('--hero-shift',Math.min(distance*.36,height*.36)+'px');
  hero.style.setProperty('--photo-shift',Math.min(distance*.08,height*.08)+'px');
  hero.style.setProperty('--hero-darkness',String(Math.min(.9,progress*.98)));
 }else{
  hero.style.removeProperty('--hero-shift');hero.style.removeProperty('--photo-shift');hero.style.removeProperty('--hero-darkness');
 }
 bar.classList.toggle('visible',scrollY>height*.6&&!quizInView);
}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(scrollFrame)}},{passive:true});addEventListener('resize',scrollFrame);scrollFrame();renderCase();setTimeout(()=>document.querySelector('.intro')?.remove(),2600);

document.querySelector('#select-video').addEventListener('click',()=>document.querySelector('#video-file').click());

reduced.addEventListener('change',scrollFrame);

// Keep each heading line in its own animation mask on desktop and mobile.
const heroHeading=document.querySelector('#hero-title');
const heroTitleParts = [...heroHeading.querySelectorAll('.hero-line > span')].map(line => {
 const parts = [[]];
 for (const node of line.childNodes) {
  if (node.nodeName === 'WBR') parts.push([]);
  else parts[parts.length - 1].push(node);
 }
 return parts;
});
const desktopHeroLines = heroTitleParts.map(parts => parts.flat());
const narrowHero=matchMedia('(max-width:760px)');
const heroTitle = desktopHeroLines.map(line => line.map(node => node.textContent).join('')).join(' ');
heroHeading.setAttribute('aria-label', heroTitle);
function fitHeroLines(){
 const lines=narrowHero.matches?heroTitleParts.flat():desktopHeroLines;
 heroHeading.replaceChildren(...lines.map((nodes,i)=>{
  const mask=document.createElement('span'),ink=document.createElement('span');
  mask.className='hero-line';mask.style.setProperty('--line',String(i));
  ink.append(...nodes.map(node => node.cloneNode(true)));
  mask.append(ink);
  return mask;
 }));
}
fitHeroLines();
setTimeout(()=>heroHeading.classList.add('motion-settled'),4900);
narrowHero.addEventListener('change',()=>{heroHeading.classList.add('motion-settled');fitHeroLines()});

const heroBrandViewport = document.querySelector('#truck-brands .brand-viewport');
const serviceBrands = document.querySelector('.brand-strip--services');
if (heroBrandViewport && serviceBrands) {
  const viewport = heroBrandViewport.cloneNode(true);
  viewport.removeAttribute('tabindex');
  for (const logo of viewport.querySelectorAll('img')) logo.loading = 'lazy';
  serviceBrands.append(viewport);
  serviceBrands.hidden = false;
}

for (const brandStrip of document.querySelectorAll('.brand-strip:not([hidden])')) {
  const viewport = brandStrip.querySelector('.brand-viewport');
  const track = brandStrip.querySelector('.brand-track');
  const keyboardScrollable = viewport.hasAttribute('tabindex');
  const duplicate = track.firstElementChild.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  track.append(duplicate);
  const setBrandMotion = () => {
    const animate = !reduced.matches;
    brandStrip.classList.toggle('is-animated', animate);
    duplicate.hidden = !animate;
    if (keyboardScrollable) viewport.tabIndex = animate ? -1 : 0;
    if (animate) viewport.scrollLeft = 0;
  };
  reduced.addEventListener('change', setBrandMotion);
  setBrandMotion();
}

const priceLayout = document.querySelector('.price-layout');
if (priceLayout) {
  const picker = priceLayout.querySelector('.price-picker');
  const menu = picker.querySelector('.price-menu');
  const categoryTrigger = priceLayout.querySelector('.price-category-trigger');
  const categoryDialog = priceLayout.querySelector('.price-category-dialog');
  const categoryOptions = categoryDialog.querySelector('.price-category-options');
  const panels = [...priceLayout.querySelectorAll('.price-panel')];
  const titles = panels.map(panel => panel.querySelector('.price-panel-title').textContent);
  const tabs = titles.map((title, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.textContent = title;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    tab.addEventListener('click', () => showPriceCategory(index));
    menu.append(tab);
    panels[index].setAttribute('role', 'tabpanel');
    return tab;
  });
  const choices = titles.map((title, index) => {
    const choice = document.createElement('button');
    choice.type = 'button';
    choice.textContent = title;
    choice.addEventListener('click', () => {
      showPriceCategory(index);
      closeDialog(categoryDialog);
    });
    categoryOptions.append(choice);
    return choice;
  });

  function showPriceCategory(index) {
    panels.forEach((panel, position) => {
      const active = position === index;
      panel.hidden = !active;
      panel.tabIndex = active ? 0 : -1;
      tabs[position].setAttribute('aria-selected', String(active));
      tabs[position].tabIndex = active ? 0 : -1;
      choices[position].setAttribute('aria-current', String(active));
    });
    categoryTrigger.setAttribute('aria-describedby', panels[index].getAttribute('aria-labelledby'));
  }

  categoryTrigger.addEventListener('click', () => {
    openDialog(categoryDialog);
    categoryTrigger.setAttribute('aria-expanded', 'true');
    categoryOptions.querySelector('[aria-current="true"]').focus();
  });
  categoryDialog.addEventListener('close', () => categoryTrigger.setAttribute('aria-expanded', 'false'));
  narrowHero.addEventListener('change', event => {
    if (!event.matches && categoryDialog.open) {
      closeDialog(categoryDialog);
      menu.querySelector('[aria-selected="true"]').focus();
    }
  });
  menu.addEventListener('keydown', event => {
    const current = tabs.indexOf(event.target);
    const destinations = {
      ArrowUp: (current + tabs.length - 1) % tabs.length,
      ArrowDown: (current + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const destination = destinations[event.key];
    if (current < 0 || destination === undefined) return;

    event.preventDefault();
    showPriceCategory(destination);
    tabs[destination].focus();
  });

  const linkedCategory = panels.findIndex(panel => '#' + panel.id === location.hash);
  showPriceCategory(Math.max(0, linkedCategory));
  picker.hidden = false;
  priceLayout.classList.add('has-price-picker');
}

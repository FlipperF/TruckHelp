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
const leadImage = leadDialog.querySelector('.modal-photo img');
const generalLeadPhoto = {
  src: leadImage.getAttribute('src'),
  alt: leadImage.alt,
};
const serviceEstimates = new Map(
  [...document.querySelectorAll('.service-card [data-estimate]')].map(button => {
    const image = button.closest('.service-card').querySelector('img');
    return [button.dataset.priceCategory, {
      subject: button.dataset.lead,
      estimate: button.dataset.estimate,
      photo: { src: image.getAttribute('src'), alt: image.alt, cropRight: image.classList.contains('crop-right') },
    }];
  })
);
serviceEstimates.set('price-visit', {
  subject: 'Выезд и диагностика',
  estimate: 'выезда и диагностики',
  photo: { src: 'assets/price-visit.webp', alt: 'Мастер проводит диагностику грузовика на выезде', cropRight: true },
});
function openDialog(d){lastFocus=document.activeElement;d.showModal();document.body.classList.add('locked')}
function closeDialog(d){d.querySelectorAll('video').forEach(v=>v.pause());d.close();document.body.classList.remove('locked');lastFocus?.focus()}
function lead({ subject, estimate, photo = generalLeadPhoto, askQuestion = false }) {
  const form = leadDialog.querySelector('form');
  const question = form.elements.question;
  let title = 'Заказать звонок мастера';
  let description = 'Перезвоним, уточним поломку и согласуем выезд.';
  if (askQuestion) {
    title = 'Задать вопрос мастеру';
    description = 'Напишите вопрос и оставьте номер. Мастер перезвонит и ответит.';
  } else if (estimate) {
    title = `Расчёт стоимости ${estimate}`;
    description = 'Оставьте номер. Перезвоним, уточним детали и сориентируем по стоимости работ.';
  }
  leadDialog.querySelector('#lead-title').textContent = title;
  leadDialog.querySelector('.modal-copy > p').textContent = description;
  leadImage.src = photo.src;
  leadImage.alt = photo.alt;
  leadImage.classList.toggle('crop-right', Boolean(photo.cropRight));
  form.elements.subject.value = subject;
  question.closest('label').hidden = !askQuestion;
  question.disabled = !askQuestion;
  form.querySelector('button[type="submit"]').textContent = askQuestion ? 'Отправить вопрос' : 'Жду звонка ↗';
  clearLeadFeedback(form);
  openDialog(leadDialog);
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-lead]');
  if (trigger) {
    lead(serviceEstimates.get(trigger.dataset.priceCategory) ?? {
      subject: trigger.dataset.lead,
      askQuestion: trigger.hasAttribute('data-ask-question'),
    });
  }
  const close = event.target.closest('[data-close]');
  if (close) closeDialog(close.closest('dialog'));
});
document.querySelectorAll('dialog').forEach(d=>{d.addEventListener('cancel',()=>{d.querySelectorAll('video').forEach(v=>v.pause());document.body.classList.remove('locked')});d.addEventListener('close',()=>document.body.classList.remove('locked'));d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d)})});
const portfolioImage = document.querySelector('#portfolio-image');
const portfolioDetails = document.querySelector('.portfolio-details');
const portfolioThumbs = document.querySelector('#portfolio-thumbs');
const casePosition = document.querySelector('#case-position');
const mediaStage = document.querySelector('#media-stage');
const previousMedia = document.querySelector('#prev-media');
const nextMedia = document.querySelector('#next-media');
const slideAnimations = new WeakMap();

function animateSlide(element, direction = 0) {
  slideAnimations.get(element)?.cancel();
  if (reduced.matches) return;

  const animation = element.animate([
    { opacity: .45, translate: `${direction * 8}px 0` },
    { opacity: 1, translate: '0 0' },
  ], { duration: 230, easing: 'ease-out' });
  slideAnimations.set(element, animation);
}

function photos() {
  return works[activeCase].media.filter(item => item.type === 'image');
}

function renderCase(direction = 0) {
  const work = works[activeCase];
  activePhoto = 0;
  for (const key of ['title', 'vehicle', 'location', 'problem', 'solution']) {
    document.querySelector('#portfolio-' + key).textContent = work[key];
  }
  casePosition.textContent = `${activeCase + 1} / ${works.length}`;
  portfolioThumbs.replaceChildren(...photos().map((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Фото ${index + 1}`);
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = '';
    button.append(image);
    button.addEventListener('click', () => {
      if (activePhoto !== index) changePhoto(index);
    });
    return button;
  }));
  renderPhoto(direction);
  if (direction) animateSlide(portfolioDetails);
}

function renderPhoto(direction = 0) {
  const photo = photos()[activePhoto];
  portfolioImage.src = photo.src;
  portfolioImage.alt = photo.alt;
  [...portfolioThumbs.children].forEach((button, index) => {
    button.setAttribute('aria-pressed', String(index === activePhoto));
  });
  if (direction) animateSlide(portfolioImage, direction);
  if (mediaDialog.open) renderLargePhoto(direction);
}

function changeCase(direction) {
  activeCase = (activeCase + direction + works.length) % works.length;
  renderCase(direction);
}

function changePhoto(index) {
  const direction = Math.sign(index - activePhoto);
  activePhoto = index;
  renderPhoto(direction);
}

document.querySelector('#prev-case').addEventListener('click', () => changeCase(-1));
document.querySelector('#next-case').addEventListener('click', () => changeCase(1));
document.querySelector('.case-nav').addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  changeCase(event.key === 'ArrowLeft' ? -1 : 1);
});
document.querySelector('#similar-case').addEventListener('click', () => lead({ subject: works[activeCase].title }));

function renderLargePhoto(direction = 0) {
  const items = photos();
  const photo = items[activePhoto];
  const image = document.createElement('img');
  image.src = photo.src;
  image.alt = photo.alt;
  mediaStage.replaceChildren(image);
  document.querySelector('#media-position').textContent = `${activePhoto + 1} / ${items.length}`;
  previousMedia.disabled = nextMedia.disabled = items.length < 2;
  if (direction) animateSlide(image, direction);
}

document.querySelector('#portfolio-main').addEventListener('click', () => {
  renderLargePhoto();
  openDialog(mediaDialog);
});
previousMedia.addEventListener('click', () => changePhoto((activePhoto - 1 + photos().length) % photos().length));
nextMedia.addEventListener('click', () => changePhoto((activePhoto + 1) % photos().length));
mediaDialog.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  (event.key === 'ArrowLeft' ? previousMedia : nextMedia).click();
});
const portfolioPlayer = document.querySelector('#portfolio-player');

document.querySelector('#portfolio-video').addEventListener('click', () => {
  const work = works[activeCase];
  const video = work.media.find(item => item.type === 'video' && item.src);
  portfolioPlayer.controls = Boolean(video);
  portfolioPlayer.setAttribute('aria-label', `Видео: ${work.title}`);
  if (video?.poster) portfolioPlayer.poster = video.poster;
  else portfolioPlayer.removeAttribute('poster');

  if (video) {
    portfolioPlayer.src = video.src;
  } else if (portfolioPlayer.hasAttribute('src')) {
    portfolioPlayer.removeAttribute('src');
    portfolioPlayer.load();
  }
  openDialog(videoDialog);
});

portfolioPlayer.addEventListener('error', () => {
  portfolioPlayer.controls = false;
});
function clearLeadFeedback(form) {
  const invalid = form.querySelector('[aria-invalid="true"]');
  invalid?.removeAttribute('aria-invalid');
  invalid?.removeAttribute('aria-describedby');
  form.querySelector('.form-error').textContent = '';
  form.querySelector('.form-status').textContent = '';
}

const requiredFieldMessages = {
  name: 'Введите ваше имя.',
  phone: 'Введите номер телефона.',
  question: 'Напишите ваш вопрос.',
};

for (const form of document.querySelectorAll('[data-form]')) {
  const error = form.querySelector('.form-error');
  const status = form.querySelector('.form-status');
  form.addEventListener('input', () => clearLeadFeedback(form));
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearLeadFeedback(form);

    for (const field of form.querySelectorAll('input[required]:enabled, textarea[required]:enabled')) {
      const value = field.value.trim();
      let message = '';
      if (!value) {
        message = requiredFieldMessages[field.name];
      } else if (field.name === 'phone' && (!/^[\d+\s().-]+$/.test(value) || !/^\d{10,15}$/.test(value.replace(/\D/g, '')))) {
        message = 'Введите номер телефона от 10 до 15 цифр.';
      }
      if (!message) continue;

      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', error.id);
      error.textContent = message;
      field.focus();
      return;
    }

    form.reset();
    status.textContent = 'Демонстрация: данные не отправлены. Приём заявок ещё не подключён.';
  });
}
const menuToggle = document.querySelector('.menu-toggle');
const headerMenu = document.querySelector('#header-menu');
const headerShell = document.querySelector('.header-shell');
const headerSizeObserver = new ResizeObserver(([entry]) => {
  document.documentElement.style.setProperty('--sticky-header-height', `${entry.target.offsetHeight}px`);
});
headerSizeObserver.observe(headerShell);
function setHeaderMenu(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  headerMenu.classList.toggle('open', open);
}
menuToggle.addEventListener('click', () => setHeaderMenu(!headerMenu.classList.contains('open')));
document.addEventListener('click', event => {
  if (headerMenu.classList.contains('open') && (!event.target.closest('#header-menu, .menu-toggle') || event.target.closest('#header-menu a'))) {
    setHeaderMenu(false);
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && headerMenu.classList.contains('open') && menuToggle.getClientRects().length) {
    setHeaderMenu(false);
    menuToggle.focus();
  }
});
const reduced=matchMedia('(prefers-reduced-motion: reduce)');const hero=document.querySelector('.hero'),track=document.querySelector('.hero-track');let scheduled=false;
function scrollFrame(){
 scheduled=false;
 const r=track.getBoundingClientRect(),height=r.height;
 const distance=Math.max(0,-r.top),progress=Math.min(1,distance/height);
 headerShell.classList.toggle('is-scrolled', window.scrollY > 12);
 if(!reduced.matches){
  hero.style.setProperty('--hero-shift',Math.min(distance*.36,height*.36)+'px');
  hero.style.setProperty('--photo-shift',Math.min(distance*.08,height*.08)+'px');
  hero.style.setProperty('--hero-darkness',String(Math.min(.9,progress*.98)));
 }else{
  hero.style.removeProperty('--hero-shift');hero.style.removeProperty('--photo-shift');hero.style.removeProperty('--hero-darkness');
 }
}
addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(scrollFrame)}},{passive:true});addEventListener('resize',scrollFrame);scrollFrame();renderCase();setTimeout(()=>document.querySelector('.intro')?.remove(),2600);

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

const closingTruck = document.querySelector('.closing-contact-truck');
const closingTruckObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    closingTruck.classList.add('is-arrived');
    closingTruckObserver.unobserve(closingTruck);
  }
}, { threshold: .25 });
closingTruckObserver.observe(closingTruck);

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
  const estimateButton = priceLayout.querySelector('[data-price-estimate]');
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
    const changed = panels[index].hidden;
    panels.forEach((panel, position) => {
      const active = position === index;
      panel.hidden = !active;
      panel.tabIndex = active ? 0 : -1;
      tabs[position].setAttribute('aria-selected', String(active));
      tabs[position].tabIndex = active ? 0 : -1;
      choices[position].setAttribute('aria-current', String(active));
    });
    categoryTrigger.setAttribute('aria-describedby', panels[index].getAttribute('aria-labelledby'));
    estimateButton.dataset.lead = titles[index];
    estimateButton.dataset.priceCategory = panels[index].id;
    if (changed) animateSlide(panels[index]);
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

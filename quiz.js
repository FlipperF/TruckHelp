const quiz = document.querySelector('[data-quiz]');
const stepContent = quiz.querySelector('.quiz-step-content');
const quizSteps = [...quiz.querySelectorAll('[data-quiz-step]')];
const progress = quiz.querySelector('progress');
const stepCount = quiz.querySelector('[data-quiz-count]');
const percent = quiz.querySelector('[data-quiz-percent]');
const back = quiz.querySelector('[data-quiz-back]');
const next = quiz.querySelector('[data-quiz-next]');
const submit = next.closest('button');
const error = quiz.querySelector('.quiz-error');
const result = quiz.querySelector('[data-quiz-result]');
const otherBrand = quiz.elements.otherBrand;
let currentStep = 0;

const emptyFieldMessages = {
  otherBrand: 'Введите марку грузовика или прицепа.',
  model: 'Введите модель машины.',
  location: 'Укажите адрес или ориентир.',
  name: 'Введите ваше имя.',
  phone: 'Введите номер телефона.',
};

function updateOtherBrand() {
  const isOther = quiz.elements.brand.value === 'other';
  otherBrand.closest('label').hidden = !isOther;
  otherBrand.disabled = !isOther;
  otherBrand.required = isOther;
}

function clearFeedback() {
  const invalid = quiz.querySelector('[aria-invalid="true"]');
  invalid?.removeAttribute('aria-invalid');
  invalid?.removeAttribute('aria-describedby');
  error.hidden = true;
  error.textContent = '';
  result.hidden = true;
  result.textContent = '';
}

function showStep(index) {
  clearFeedback();
  quizSteps[currentStep].hidden = true;
  currentStep = index;
  const step = quizSteps[index];
  step.hidden = false;
  step.dataset.motion = '';
  const number = index + 1;
  progress.value = number;
  stepCount.textContent = `Шаг ${number} из ${quizSteps.length}`;
  percent.textContent = `${Math.round(number / quizSteps.length * 100)}%`;
  back.hidden = index === 0;
  next.textContent = number === quizSteps.length ? 'Получить расчёт' : 'Далее';

  stepContent.scrollTop = 0;
  step.querySelector('h3').focus({ preventScroll: true });
}

function markInvalid(field, message) {
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', error.id);
  error.textContent = message;
  error.hidden = false;
  field.focus();
  return false;
}

function validateStep() {
  const step = quizSteps[currentStep];
  const radio = step.querySelector('input[type="radio"]');
  if (radio && !quiz.elements[radio.name].value) {
    return markInvalid(radio, radio.name === 'brand' ? 'Выберите марку машины.' : 'Выберите тип проблемы.');
  }

  for (const field of step.querySelectorAll('input[required]:not(:disabled)')) {
    if (!field.value.trim()) {
      return markInvalid(field, emptyFieldMessages[field.name]);
    }
  }

  const phone = step.querySelector('input[type="tel"]');
  if (phone && !/^[\d+\s().-]+$/.test(phone.value)) {
    return markInvalid(phone, 'Введите номер телефона цифрами.');
  }
  if (phone && !/^\d{10,15}$/.test(phone.value.replace(/\D/g, ''))) {
    return markInvalid(phone, 'Введите номер телефона от 10 до 15 цифр.');
  }
  return true;
}

quiz.addEventListener('input', event => {
  if (event.target.name === 'brand') updateOtherBrand();
  clearFeedback();
});

back.addEventListener('click', () => showStep(currentStep - 1));
quiz.addEventListener('submit', event => {
  event.preventDefault();
  clearFeedback();
  if (!validateStep()) return;
  if (currentStep < quizSteps.length - 1) {
    showStep(currentStep + 1);
    return;
  }

  // This prototype keeps the answers in the form until a lead endpoint is configured.
  const answers = new FormData(quiz);
  const brand = answers.get('brand') === 'other' ? answers.get('otherBrand') : answers.get('brand');
  result.textContent = `Проверили ответы по заявке: ${brand.trim()}, ${answers.get('model').trim()}. В демоверсии данные не отправляются.`;
  result.hidden = false;
});

updateOtherBrand();
submit.disabled = false;

(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  const progressBar = $('#readingProgress');
  const updateProgress = () => {
    const fullHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${fullHeight > 0 ? (window.scrollY / fullHeight) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const themeButton = $('#themeToggle');
  const setThemeIcon = () => {
    themeButton.textContent = document.body.classList.contains('dark-mode') ? '☾' : '☼';
  };
  try {
    if (localStorage.getItem('propagacion-theme') === 'dark') document.body.classList.add('dark-mode');
  } catch { /* The page still works when browser storage is unavailable. */ }
  setThemeIcon();
  themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    try { localStorage.setItem('propagacion-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); } catch { /* Saving the preference is optional. */ }
    setThemeIcon();
  });

  const correctExercises = new Set();
  const updatePracticeCount = () => {
    $('#practiceCount').textContent = `${correctExercises.size} de 8 respuestas correctas`;
  };

  $$('.exercise-card').forEach(card => {
    const valueInput = $('.answer-value', card);
    const uncertaintyInput = $('.answer-uncertainty', card);
    const feedback = $('.exercise-feedback', card);
    const checkButton = $('.check-answer', card);

    checkButton.addEventListener('click', () => {
      if (valueInput.value.trim() === '' || uncertaintyInput.value.trim() === '') {
        feedback.textContent = 'Completa el valor y la incerteza para comprobar.';
        feedback.className = 'exercise-feedback incorrect';
        return;
      }

      const enteredValue = Number(valueInput.value);
      const enteredUncertainty = Number(uncertaintyInput.value);
      const expectedValue = Number(card.dataset.value);
      const expectedUncertainty = Number(card.dataset.uncertainty);
      const valueTolerance = Number(card.dataset.valueTolerance);
      const uncertaintyTolerance = Number(card.dataset.uncertaintyTolerance);
      const valueIsCorrect = Number.isFinite(enteredValue) && Math.abs(enteredValue - expectedValue) <= valueTolerance;
      const uncertaintyIsCorrect = Number.isFinite(enteredUncertainty) && Math.abs(enteredUncertainty - expectedUncertainty) <= uncertaintyTolerance;

      if (valueIsCorrect && uncertaintyIsCorrect) {
        feedback.textContent = '¡Correcto! El valor y la incerteza están dentro del redondeo esperado.';
        feedback.className = 'exercise-feedback correct';
        correctExercises.add(card);
      } else {
        const valueHint = valueIsCorrect ? '' : 'Revisa el valor resultante. ';
        const uncertaintyHint = uncertaintyIsCorrect ? '' : 'Revisa la propagación y el redondeo de la incerteza.';
        feedback.textContent = `${valueHint}${uncertaintyHint}`.trim();
        feedback.className = 'exercise-feedback incorrect';
        correctExercises.delete(card);
      }
      updatePracticeCount();
    });
  });

  updatePracticeCount();
})();

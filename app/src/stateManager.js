// Hafıza ve Durum Yönetimi

const STORAGE_KEY = 'kpss_ai_mentor_state_v2';

export const INITIAL_STATE = {
  settings: {
    apiKey: '',
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    studentName: 'Öğrenci'
  },
  workflowState: 'INIT', // 'INIT' | 'DIAGNOSTIC_TEST' | 'DEFICIENCY_ROADMAP' | 'MICRO_STEP_LEARNING'
  diagnosticState: {
    isCompleted: false,
    currentIndex: 0,
    answers: {}, // { [questionId]: { selectedOption: '', isCorrect: true/false } }
    weaknesses: [] // [{ topicId, topicTitle, weakness, prerequisite }]
  },
  learningPath: {
    priorityTopics: [], // ['01_temel_islemler', '03_tek_cift_sayilar'...]
    currentTopicIndex: 0,
    currentMicroStep: 1,
    totalMicroSteps: 3
  },
  activeSession: {
    currentUnitId: null,
    currentUnitTitle: '',
    chatHistory: [] // [{ sender: 'ai'|'user', message: '', command: {}, timestamp }]
  },
  stats: {
    totalCorrect: 0,
    totalWrong: 0,
    completedMicroSteps: 0
  }
};

export const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...INITIAL_STATE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('State load error:', e);
  }
  return INITIAL_STATE;
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('State save error:', e);
  }
};

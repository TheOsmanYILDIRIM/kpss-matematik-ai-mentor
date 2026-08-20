// Hafıza ve Durum Yönetimi (LocalStorage & State Machine)

const STORAGE_KEY = 'kpss_ai_mentor_state_v1';

export const INITIAL_STATE = {
  settings: {
    apiKey: '',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    studentName: 'Öğrenci'
  },
  workflowState: 'INIT', // INIT, DIAGNOSTIC_SETUP, DIAGNOSTIC_IN_PROGRESS, DEFICIENCY_DETECTED, PLANNING_NEXT_TOPIC, UNIT_EXPLANATION, SCAFFOLDED_QUESTION, VERIFICATION
  curriculumProgress: {}, // { [unitId]: { status: 'NOT_STARTED'|'IN_PROGRESS'|'MASTERED', score: 0, deficiencies: [] } }
  activeSession: {
    currentUnitId: null,
    currentUnitTitle: '',
    questionText: '',
    totalSteps: 1,
    currentStepIndex: 0,
    steps: [], // [{ stepNumber, instruction, hint, isDone, feedback }]
    chatHistory: [] // [{ sender: 'ai'|'user', message: '', timestamp, jsonCommand }]
  },
  diagnosticSummary: {
    isCompleted: false,
    totalQuestions: 0,
    correctCount: 0,
    identifiedWeaknesses: []
  },
  stats: {
    totalStepsCompleted: 0,
    totalQuestionsSolved: 0,
    streakDays: 1
  }
};

export const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...INITIAL_STATE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('State yüklenirken hata:', e);
  }
  return INITIAL_STATE;
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('State kaydedilirken hata:', e);
  }
};

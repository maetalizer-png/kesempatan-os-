
export const CAI_State = {
    speechEnabled: true,
    currentUtterance: null,
    recognition: null,
    isListening: false,
    currentAbortController: null,
    darkMode: true,
    typingSoundEnabled: true,
    typingSoundContext: null,
    userPreferences: {},
    feedbackHistory: [],
    stylePreference: 'casual',
    languagePreference: 'id',
    conversationContext: [],
    queryCache: new Map(),
    isSendingToAI: false
};

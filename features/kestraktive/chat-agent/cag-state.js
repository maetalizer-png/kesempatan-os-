
export const CAG_State = {
    currentUtterance: null,
    recognition: null,
    isListening: false,
    currentAbortController: null,
    darkMode: true,
    typingSoundEnabled: true,
    typingSoundContext: null,
    queryCache: new Map(),
    speechEnabled: true,
    userPreferences: {},
    stylePreference: 'casual',
    languagePreference: 'id',
    isSendingToAgent: false
};

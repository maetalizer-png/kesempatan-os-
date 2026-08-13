
export const FOR_State = {
    currentUtterance: null,
    recognition: null,
    isListening: false,
    typingSoundEnabled: true,
    typingSoundContext: null,
    queryCache: new Map(),
    forumAbort: false,
    forumRunning: false,
    darkMode: true,
    currentAbortController: null,
    userPreferences: {},
    stylePreference: 'casual',
    languagePreference: 'id'
};

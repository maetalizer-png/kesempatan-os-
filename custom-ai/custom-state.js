import { CustomAIConfig } from './custom-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

let customAgents = [];
let agentRatings = {};
let agentVersions = {};
let agentAnalytics = {};
let agentFeedback = {};
let agentTraining = {};
let isGenerating = false;
let editingAgentId = null;
let selectedAgents = new Set();
let filterTag = 'all';
let filterCategory = 'all';
let searchQuery = '';
let sortMode = 'aiScore';
let currentTags = [];

const loadCustomAgents = function() {
    const saved = localStorage.getItem(CustomAIConfig.STORAGE_KEY);
    if (saved) {
        try { customAgents = JSON.parse(saved); } catch (e) { console.warn('[CustomAI] Load agents failed:', e.message); }
    }
    return customAgents;
};
const saveCustomAgents = function() {
    localStorage.setItem(CustomAIConfig.STORAGE_KEY, JSON.stringify(customAgents));
};

const loadRatings = function() {
    const saved = localStorage.getItem(CustomAIConfig.RATING_KEY);
    if (saved) {
        try { agentRatings = JSON.parse(saved); } catch (e) { console.warn('[CustomAI] Load ratings failed:', e.message); }
    }
    return agentRatings;
};
const saveRatings = function() {
    localStorage.setItem(CustomAIConfig.RATING_KEY, JSON.stringify(agentRatings));
};

const loadTemplates = function() {
    const saved = localStorage.getItem(CustomAIConfig.TEMPLATES_KEY);
    if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.warn('[CustomAI] Load templates failed:', e.message); }
    }
    return {};
};
const saveTemplates = function(templates) {
    localStorage.setItem(CustomAIConfig.TEMPLATES_KEY, JSON.stringify(templates));
};

const loadAnalytics = function() {
    const saved = localStorage.getItem(CustomAIConfig.ANALYTICS_KEY);
    if (saved) {
        try { agentAnalytics = JSON.parse(saved); } catch (e) { console.warn('[CustomAI] Load analytics failed:', e.message); }
    }
    return agentAnalytics;
};
const saveAnalytics = function() {
    localStorage.setItem(CustomAIConfig.ANALYTICS_KEY, JSON.stringify(agentAnalytics));
};

const loadFeedback = function() {
    const saved = localStorage.getItem(CustomAIConfig.FEEDBACK_KEY);
    if (saved) {
        try { agentFeedback = JSON.parse(saved); } catch (e) { console.warn('[CustomAI] Load feedback failed:', e.message); }
    }
    return agentFeedback;
};
const saveFeedback = function() {
    localStorage.setItem(CustomAIConfig.FEEDBACK_KEY, JSON.stringify(agentFeedback));
};

const loadTraining = function() {
    const saved = localStorage.getItem(CustomAIConfig.TRAINING_KEY);
    if (saved) {
        try { agentTraining = JSON.parse(saved); } catch (e) { console.warn('[CustomAI] Load training failed:', e.message); }
    }
    return agentTraining;
};
const saveTraining = function() {
    localStorage.setItem(CustomAIConfig.TRAINING_KEY, JSON.stringify(agentTraining));
};

export const CustomAIState = {
    getAgents: function() { return customAgents; },
    getRatings: function() { return agentRatings; },
    getVersions: function() { return agentVersions; },
    getAnalytics: function() { return agentAnalytics; },
    getFeedback: function() { return agentFeedback; },
    getTraining: function() { return agentTraining; },
    isGenerating: function() { return isGenerating; },
    getEditingId: function() { return editingAgentId; },
    getSelected: function() { return selectedAgents; },
    getFilterTag: function() { return filterTag; },
    getFilterCategory: function() { return filterCategory; },
    getSearchQuery: function() { return searchQuery; },
    getSortMode: function() { return sortMode; },
    getCurrentTags: function() { return currentTags; },
    setAgents: function(val) { customAgents = val; },
    setRatings: function(val) { agentRatings = val; },
    setAnalytics: function(val) { agentAnalytics = val; },
    setTraining: function(val) { agentTraining = val; },
    setIsGenerating: function(val) { isGenerating = val; },
    setEditingId: function(val) { editingAgentId = val; },
    setFilterTag: function(val) { filterTag = val; },
    setFilterCategory: function(val) { filterCategory = val; },
    setSearchQuery: function(val) { searchQuery = val; },
    setSortMode: function(val) { sortMode = val; },
    setCurrentTags: function(val) { currentTags = val; },
    addSelected: function(id) { selectedAgents.add(id); },
    deleteSelected: function(id) { selectedAgents.delete(id); },
    clearSelected: function() { selectedAgents.clear(); },
    loadAgents: loadCustomAgents,
    saveAgents: saveCustomAgents,
    loadRatings: loadRatings,
    saveRatings: saveRatings,
    loadTemplates: loadTemplates,
    saveTemplates: saveTemplates,
    loadAnalytics: loadAnalytics,
    saveAnalytics: saveAnalytics,
    loadFeedback: loadFeedback,
    saveFeedback: saveFeedback,
    loadTraining: loadTraining,
    saveTraining: saveTraining
};
KESEMPATAN.CustomAIState = CustomAIState;

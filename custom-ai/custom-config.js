const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const STORAGE_KEY = 'kes_custom_agents';
const TEMPLATES_KEY = 'kes_agent_templates';
const RATING_KEY = 'kes_agent_ratings';
const VERSIONS_KEY = 'kes_agent_versions';
const ANALYTICS_KEY = 'kes_agent_analytics';
const FEEDBACK_KEY = 'kes_agent_feedback';
const TRAINING_KEY = 'kes_agent_training';

const AVATARS = ['●', '○', '◆', '◇', '▲', '△', '■', '□', '▼', '▽', '▶', '◀', '★', '☆', '✦', '', '◈', '', '✚', ''];

const CATEGORIES = ['Business', 'Finance', 'Technology', 'Marketing', 'Creative', 'Startup', 'Education', 'Health', 'Legal', 'General'];

const ALL_TAGS = ['marketing', 'finance', 'tech', 'creative', 'startup', 'business', 'ai', 'design', 'investment', 'digital', 'education', 'health', 'legal', 'sales', 'product', 'data', 'writing', 'ux', 'mentor', 'analyst'];

export const CustomAIConfig = {
    STORAGE_KEY: STORAGE_KEY,
    TEMPLATES_KEY: TEMPLATES_KEY,
    RATING_KEY: RATING_KEY,
    VERSIONS_KEY: VERSIONS_KEY,
    ANALYTICS_KEY: ANALYTICS_KEY,
    FEEDBACK_KEY: FEEDBACK_KEY,
    TRAINING_KEY: TRAINING_KEY,
    AVATARS: AVATARS,
    CATEGORIES: CATEGORIES,
    ALL_TAGS: ALL_TAGS
};
KESEMPATAN.CustomAIConfig = CustomAIConfig;

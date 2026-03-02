const isDev = process.env.NODE_ENV === 'development';

export interface Tool {
    id: string;
    name: string;
    url: string;
    status: 'active' | 'beta' | 'coming-soon';
    color: string;
    secondaryColor: string;
    icon?: string;
}

export const tools: Tool[] = [
    {
        id: 'website-tool',
        name: 'Website Tool',
        url: isDev ? 'https://website.switch-to.test' : 'https://website.switch-to.eu',
        status: 'coming-soon',
        color: 'emerald-600',
        secondaryColor: 'teal-600',
        icon: 'globe'
    },
    {
        id: 'plotty',
        name: 'Plotty',
        url: isDev ? 'https://poll.switch-to.test' : 'https://plotty.eu',
        status: 'coming-soon',
        color: 'purple-600',
        secondaryColor: 'blue-600',
        icon: 'calendar'
    },
    {
        id: 'listy',
        name: 'Listy',
        url: isDev ? 'https://list.switch-to.test' : 'https://list.switch-to.eu',
        status: 'coming-soon',
        color: 'teal-600',
        secondaryColor: 'green-600',
        icon: 'list-checks'
    },
    {
        id: 'keepfocus',
        name: 'KeepFocus',
        url: isDev ? 'https://focus.switch-to.test' : 'https://keepfocus.eu',
        status: 'active',
        color: 'blue-600',
        secondaryColor: 'purple-600',
        icon: 'target'
    },
    {
        id: 'privnote',
        name: 'PrivNote',
        url: isDev ? 'https://note.switch-to.test' : 'https://privnote.switch-to.eu',
        status: 'coming-soon',
        color: 'amber-600',
        secondaryColor: 'orange-600',
        icon: 'file-lock'
    },
    {
        id: 'quiz',
        name: 'Quiz',
        url: isDev ? 'https://quiz.switch-to.test' : 'https://quiz.switch-to.eu',
        status: 'active',
        color: 'rose-600',
        secondaryColor: 'orange-600',
        icon: 'brain'
    },
    {
        id: 'kanban',
        name: 'Kanban',
        url: isDev ? 'https://kanban.switch-to.test' : 'https://kanban.switch-to.eu',
        status: 'coming-soon',
        color: 'indigo-600',
        secondaryColor: 'violet-600',
        icon: 'kanban-square'
    }
];

export const getToolById = (id: string): Tool | undefined => {
    return tools.find(tool => tool.id === id);
};

export const getActiveTools = (): Tool[] => {
    if (isDev) return tools;
    return tools.filter(tool => tool.status === 'active');
};

export const getToolsByStatus = (status: Tool['status']): Tool[] => {
    return tools.filter(tool => tool.status === status);
};

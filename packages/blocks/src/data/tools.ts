const isDev = process.env.NODE_ENV === 'development';

export interface Tool {
    id: string;
    name: string;
    description: string;
    url: string;
    status: 'active' | 'beta' | 'coming-soon';
    icon?: string;
}

export const tools: Tool[] = [
    {
        id: 'eu-scan',
        name: 'EU-Scan',
        description: 'Scan any website to check its EU compliance and data practices',
        url: isDev ? 'https://scan.switch-to.test' : 'https://scan.switch-to.eu',
        status: 'coming-soon',
        icon: 'globe'
    },
    {
        id: 'plotty',
        name: 'Plotty',
        description: 'Create privacy-friendly polls and vote together',
        url: isDev ? 'https://poll.switch-to.test' : 'https://plotty.eu',
        status: 'coming-soon',
        icon: 'calendar'
    },
    {
        id: 'listy',
        name: 'Listy',
        description: 'Shared lists for shopping, potlucks, and more',
        url: isDev ? 'https://list.switch-to.test' : 'https://list.switch-to.eu',
        status: 'coming-soon',
        icon: 'list-checks'
    },
    {
        id: 'keepfocus',
        name: 'KeepFocus',
        description: 'Pomodoro timer and task manager for deep focus',
        url: isDev ? 'https://focus.switch-to.test' : 'https://keepfocus.eu',
        status: 'active',
        icon: 'target'
    },
    {
        id: 'privnote',
        name: 'PrivNote',
        description: 'Self-destructing encrypted notes for sensitive info',
        url: isDev ? 'https://note.switch-to.test' : 'https://privnote.switch-to.eu',
        status: 'coming-soon',
        icon: 'file-lock'
    },
    {
        id: 'quiz',
        name: 'Quiz',
        description: 'Test your knowledge about EU digital privacy',
        url: isDev ? 'https://quiz.switch-to.test' : 'https://quiz.switch-to.eu',
        status: 'active',
        icon: 'brain'
    },
    {
        id: 'kanban',
        name: 'Kanban',
        description: 'Simple kanban boards for project management',
        url: isDev ? 'https://kanban.switch-to.test' : 'https://kanban.switch-to.eu',
        status: 'coming-soon',
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

export const getAllToolsSorted = (): Tool[] => {
    return [...tools].sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return 0;
    });
};

export const getToolsByStatus = (status: Tool['status']): Tool[] => {
    return tools.filter(tool => tool.status === status);
};

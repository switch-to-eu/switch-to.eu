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
        id: 'plotty',
        name: 'Plotty',
        url: 'https://plotty.eu',
        status: 'active',
        color: 'purple-600',
        secondaryColor: 'blue-600',
        icon: 'calendar'
    },
    {
        id: 'listy',
        name: 'Listy',
        url: 'https://list.switch-to.eu',
        status: 'active',
        color: 'teal-600',
        secondaryColor: 'green-600',
        icon: 'list-checks'
    },
    {
        id: 'keepfocus',
        name: 'KeepFocus',
        url: 'https://keepfocus.eu',
        status: 'active',
        color: 'blue-600',
        secondaryColor: 'purple-600',
        icon: 'target'
    },
    {
        id: 'privnote',
        name: 'PrivNote',
        url: 'https://privnote.switch-to.eu',
        status: 'active',
        color: 'amber-600',
        secondaryColor: 'orange-600',
        icon: 'file-lock'
    },
    {
        id: 'quiz',
        name: 'Quiz',
        url: 'https://quiz.switch-to.eu',
        status: 'active',
        color: 'rose-600',
        secondaryColor: 'orange-600',
        icon: 'brain'
    }
];

export const getToolById = (id: string): Tool | undefined => {
    return tools.find(tool => tool.id === id);
};

export const getActiveTools = (): Tool[] => {
    return tools.filter(tool => tool.status === 'active');
};

export const getToolsByStatus = (status: Tool['status']): Tool[] => {
    return tools.filter(tool => tool.status === status);
};

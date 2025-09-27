import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'completed';
  stage: 'pre-event' | 'during-event' | 'post-event';
  subtasks: { id: string; title: string; completed: boolean }[];
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  serviceType: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  skills: string[];
  assignedTasks: string[];
}

export interface Speaker {
  id: string;
  name: string;
  bio: string;
  sessions: string[];
  confirmed: boolean;
}

export interface AgendaItem {
  id: string;
  title: string;
  type: 'session' | 'break' | 'networking';
  startTime: string;
  endTime: string;
  speaker?: string;
  track: string;
}

export interface AILog {
  id: string;
  timestamp: string;
  query: string;
}

// Mock Auth Interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'event_manager' | 'volunteer' | 'speaker' | 'attendee';
}

export interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Tasks
  tasks: Task[];
  
  // Resources
  vendors: Vendor[];
  volunteers: Volunteer[];
  speakers: Speaker[];
  
  // Event
  agenda: AgendaItem[];
  aiLogs: AILog[];
  
  // UI
  currentView: string;
  isManagingEvent: boolean;
  currentEventId: string | null;
}

// Actions
type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id'> }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { taskId: string; newStage: Task['stage'] } }
  | { type: 'ADD_AI_LOG'; payload: Omit<AILog, 'id'> }
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'START_MANAGING_EVENT'; payload: string }
  | { type: 'STOP_MANAGING_EVENT' }
  | { type: 'ADD_VENDOR'; payload: Omit<Vendor, 'id'> }
  | { type: 'UPDATE_VENDOR'; payload: Vendor }
  | { type: 'DELETE_VENDOR'; payload: string }
  | { type: 'ADD_VOLUNTEER'; payload: Omit<Volunteer, 'id'> }
  | { type: 'UPDATE_VOLUNTEER'; payload: Volunteer }
  | { type: 'DELETE_VOLUNTEER'; payload: string }
  | { type: 'ADD_SPEAKER'; payload: Omit<Speaker, 'id'> }
  | { type: 'UPDATE_SPEAKER'; payload: Speaker }
  | { type: 'DELETE_SPEAKER'; payload: string }
  | { type: 'ADD_AGENDA_ITEM'; payload: Omit<AgendaItem, 'id'> }
  | { type: 'UPDATE_AGENDA_ITEM'; payload: AgendaItem }
  | { type: 'DELETE_AGENDA_ITEM'; payload: string }
  | { type: 'LOAD_FROM_STORAGE'; payload: Partial<AppState> };

// Local storage utilities
const STORAGE_KEY = 'event-manager-data';

const saveToStorage = (state: AppState) => {
  try {
    const dataToSave = {
      tasks: state.tasks,
      vendors: state.vendors,
      volunteers: state.volunteers,
      speakers: state.speakers,
      agenda: state.agenda,
      aiLogs: state.aiLogs,
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = (): Partial<AppState> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return {};
};

// Mock users for demo
const mockUsers: User[] = [
  { id: '1', email: 'manager@event.com', name: 'Event Manager', role: 'event_manager' },
  { id: '2', email: 'volunteer@event.com', name: 'Alice Brown', role: 'volunteer' },
  { id: '3', email: 'speaker@event.com', name: 'Dr. Jane Expert', role: 'speaker' },
];

// Initial state with mock data
const initialState: AppState = {
  // Auth
  user: null,
  isAuthenticated: false,
  
  // Tasks
  tasks: [
    {
      id: '1',
      title: 'Book venue',
      description: 'Secure the main conference hall for the annual tech summit',
      dueDate: '2024-01-15',
      assignee: 'John Doe',
      status: 'completed',
      stage: 'pre-event',
      subtasks: [
        { id: '1-1', title: 'Research potential venues', completed: true },
        { id: '1-2', title: 'Get quotes from top 3 venues', completed: true },
        { id: '1-3', title: 'Site visit and final selection', completed: true },
      ]
    },
    {
      id: '2',
      title: 'Setup registration desk',
      description: 'Prepare welcome materials and check-in system for attendees',
      dueDate: '2024-01-30',
      assignee: 'Sarah Smith',
      status: 'in-progress',
      stage: 'during-event',
      subtasks: [
        { id: '2-1', title: 'Print name badges and lanyards', completed: false },
        { id: '2-2', title: 'Setup check-in computers and tablets', completed: true },
        { id: '2-3', title: 'Prepare welcome bags with materials', completed: false },
      ]
    },
    {
      id: '3',
      title: 'Send thank you emails',
      description: 'Follow up with attendees, speakers, and sponsors',
      dueDate: '2024-02-05',
      assignee: 'Mike Johnson',
      status: 'todo',
      stage: 'post-event',
      subtasks: [
        { id: '3-1', title: 'Prepare email templates', completed: false },
        { id: '3-2', title: 'Segment contact lists', completed: false },
      ]
    }
  ],
  
  // Resources
  vendors: [
    { id: '1', name: 'AV Solutions Pro', contact: 'av@solutions.com', serviceType: 'Audio/Visual', status: 'active' },
    { id: '2', name: 'Catering Plus', contact: 'hello@cateringplus.com', serviceType: 'Food & Beverage', status: 'active' },
    { id: '3', name: 'Security First', contact: 'info@securityfirst.com', serviceType: 'Security', status: 'pending' }
  ],
  
  volunteers: [
    { id: '1', name: 'Alice Brown', email: 'alice@example.com', skills: ['Registration', 'Tech Support'], assignedTasks: ['2'] },
    { id: '2', name: 'Bob Wilson', email: 'bob@example.com', skills: ['Setup', 'Logistics'], assignedTasks: [] },
    { id: '3', name: 'Carol Davis', email: 'carol@example.com', skills: ['Social Media', 'Photography'], assignedTasks: [] }
  ],
  
  speakers: [
    { id: '1', name: 'Dr. Jane Expert', bio: 'Leading AI researcher with 15 years of experience', sessions: ['Keynote'], confirmed: true },
    { id: '2', name: 'Prof. Alex Tech', bio: 'Cybersecurity specialist and author', sessions: ['Security Workshop'], confirmed: true },
    { id: '3', name: 'Maria Innovation', bio: 'Startup founder and tech entrepreneur', sessions: ['Panel Discussion'], confirmed: false }
  ],
  
  // Event
  agenda: [
    { id: '1', title: 'Opening Keynote: Future of AI', type: 'session', startTime: '09:00', endTime: '10:00', speaker: 'Dr. Jane Expert', track: 'Main Stage' },
    { id: '2', title: 'Coffee Break', type: 'break', startTime: '10:00', endTime: '10:30', track: 'Lobby' },
    { id: '3', title: 'Cybersecurity Best Practices', type: 'session', startTime: '10:30', endTime: '11:30', speaker: 'Prof. Alex Tech', track: 'Workshop Room A' }
  ],
  
  aiLogs: [],
  currentView: 'dashboard',
  isManagingEvent: false,
  currentEventId: null
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  let newState: AppState;
  
  switch (action.type) {
    case 'LOGIN':
      newState = {
        ...state,
        user: action.payload,
        isAuthenticated: true
      };
      break;
      
    case 'LOGOUT':
      newState = {
        ...state,
        user: null,
        isAuthenticated: false
      };
      break;
      
    case 'ADD_TASK':
      newState = {
        ...state,
        tasks: [...state.tasks, { ...action.payload, id: uuidv4() }]
      };
      break;
      
    case 'UPDATE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? { ...action.payload } : task
        )
      };
      break;
      
    case 'DELETE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
      break;
      
    case 'MOVE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, stage: action.payload.newStage }
            : task
        )
      };
      break;
      
    case 'ADD_VENDOR':
      newState = {
        ...state,
        vendors: [...state.vendors, { ...action.payload, id: uuidv4() }]
      };
      break;
      
    case 'UPDATE_VENDOR':
      newState = {
        ...state,
        vendors: state.vendors.map(vendor =>
          vendor.id === action.payload.id ? { ...action.payload } : vendor
        )
      };
      break;
      
    case 'DELETE_VENDOR':
      newState = {
        ...state,
        vendors: state.vendors.filter(vendor => vendor.id !== action.payload)
      };
      break;
      
    case 'ADD_VOLUNTEER':
      newState = {
        ...state,
        volunteers: [...state.volunteers, { ...action.payload, id: uuidv4() }]
      };
      break;
      
    case 'UPDATE_VOLUNTEER':
      newState = {
        ...state,
        volunteers: state.volunteers.map(volunteer =>
          volunteer.id === action.payload.id ? { ...action.payload } : volunteer
        )
      };
      break;
      
    case 'DELETE_VOLUNTEER':
      newState = {
        ...state,
        volunteers: state.volunteers.filter(volunteer => volunteer.id !== action.payload)
      };
      break;
      
    case 'ADD_SPEAKER':
      newState = {
        ...state,
        speakers: [...state.speakers, { ...action.payload, id: uuidv4() }]
      };
      break;
      
    case 'UPDATE_SPEAKER':
      newState = {
        ...state,
        speakers: state.speakers.map(speaker =>
          speaker.id === action.payload.id ? { ...action.payload } : speaker
        )
      };
      break;
      
    case 'DELETE_SPEAKER':
      newState = {
        ...state,
        speakers: state.speakers.filter(speaker => speaker.id !== action.payload)
      };
      break;
      
    case 'ADD_AGENDA_ITEM':
      newState = {
        ...state,
        agenda: [...state.agenda, { ...action.payload, id: uuidv4() }]
      };
      break;
      
    case 'UPDATE_AGENDA_ITEM':
      newState = {
        ...state,
        agenda: state.agenda.map(item =>
          item.id === action.payload.id ? { ...action.payload } : item
        )
      };
      break;
      
    case 'DELETE_AGENDA_ITEM':
      newState = {
        ...state,
        agenda: state.agenda.filter(item => item.id !== action.payload)
      };
      break;
      
    case 'ADD_AI_LOG':
      newState = {
        ...state,
        aiLogs: [...state.aiLogs, { ...action.payload, id: uuidv4() }]
      };
      break;
      
    case 'SET_VIEW':
      newState = {
        ...state,
        currentView: action.payload
      };
      break;
      
    case 'START_MANAGING_EVENT':
      newState = {
        ...state,
        isManagingEvent: true,
        currentEventId: action.payload
      };
      break;
      
    case 'STOP_MANAGING_EVENT':
      newState = {
        ...state,
        isManagingEvent: false,
        currentEventId: null
      };
      break;
      
    case 'LOAD_FROM_STORAGE':
      newState = { ...state, ...action.payload };
      break;
      
    default:
      newState = state;
  }
  
  // Save to localStorage after state updates (except for LOAD_FROM_STORAGE)
  if (action.type !== 'LOAD_FROM_STORAGE') {
    saveToStorage(newState);
  }
  
  return newState;
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  mockLogin: (email: string, password: string) => boolean;
  mockLogout: () => void;
} | null>(null);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (Object.keys(stored).length > 0) {
      dispatch({ type: 'LOAD_FROM_STORAGE', payload: stored });
    }
  }, []);

  // Mock login function
  const mockLogin = (email: string, password: string): boolean => {
    // Simple demo login - any password works
    const user = mockUsers.find(u => u.email === email);
    if (user && password.length > 0) {
      dispatch({ type: 'LOGIN', payload: user });
      return true;
    }
    return false;
  };

  // Mock logout function
  const mockLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, mockLogin, mockLogout }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Export mock users for login demo
export { mockUsers };
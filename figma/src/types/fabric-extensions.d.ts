import { FabricObject, Group, Canvas } from 'fabric';

declare module 'fabric' {
  interface FabricObject {
    id?: string;
    name?: string;
    styleId?: string;
    strokeStyleId?: string;
    prototypeTarget?: any;
    isInteractive?: boolean;
    
    // Text specific properties
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string | number;
    fontStyle?: string;
    textAlign?: string;
    lineHeight?: number;
    charSpacing?: number;
  }

  interface Group {
    autoLayout?: any;
    isResponsive?: boolean;
    originalWidth?: number;
    originalHeight?: number;
    originalObjects?: FabricObject[];
    addWithUpdate(object: FabricObject): Group;
  }

  interface TEvent<E extends Event> {
    e: E;
    target?: FabricObject;
  }

  interface Canvas {
    getActiveObjects(): FabricObject[];
  }

  // Add a utility namespace to fix the clone issue
  namespace util {
    namespace object {
      function clone<T>(object: T): T;
    }
  }

  // Add a flexible event callback type for handling various event types
  type AnyEventCallback = (options: any) => void;
}

// Define interfaces used in components
export interface AutoLayoutConfig {
  direction: 'horizontal' | 'vertical';
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  gap: number;
  alignment: 'start' | 'center' | 'end';
  distribution: 'start' | 'center' | 'end' | 'space-between';
  responsive?: boolean;
  breakpoints?: any[];
}

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  position: { x: number; y: number };
  objectId?: string;
  timestamp: number;
  resolved: boolean;
  replies: Reply[];
  mentions: string[];
}

export interface Reply {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: number;
  mentions: string[];
} 
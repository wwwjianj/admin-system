import { Ref } from 'react';

// For React DnD's hooks return values and monitor types
declare module 'react-dnd' {
  // Define monitor types
  export interface DragSourceMonitor<DragObject = any, DropResult = any> {
    canDrag(): boolean;
    isDragging(): boolean;
    getItemType(): string | symbol | null;
    getItem(): DragObject;
    getDropResult(): DropResult | null;
    didDrop(): boolean;
    getInitialClientOffset(): XYCoord | null;
    getInitialSourceClientOffset(): XYCoord | null;
    getClientOffset(): XYCoord | null;
    getDifferenceFromInitialOffset(): XYCoord | null;
    getSourceClientOffset(): XYCoord | null;
  }

  export interface DropTargetMonitor<DragObject = any, DropResult = any> {
    canDrop(): boolean;
    isOver(options?: { shallow: boolean }): boolean;
    getItemType(): string | symbol | null;
    getItem(): DragObject;
    getDropResult(): DropResult | null;
    didDrop(): boolean;
    getInitialClientOffset(): XYCoord | null;
    getInitialSourceClientOffset(): XYCoord | null;
    getClientOffset(): XYCoord | null;
    getDifferenceFromInitialOffset(): XYCoord | null;
    getSourceClientOffset(): XYCoord | null;
  }

  export interface XYCoord {
    x: number;
    y: number;
  }

  // Update useDrag hook type
  export function useDrag<DragObject = any, DropResult = any, CollectedProps = any>(
    spec: any
  ): [CollectedProps, ConnectDragSource, ConnectDragPreview];

  // Update useDrop hook type
  export function useDrop<DragObject = any, DropResult = any, CollectedProps = any>(
    spec: any
  ): [CollectedProps, ConnectDropTarget];

  // Define connector types
  export type ConnectDragSource = <T>(element: T | null) => T | null;
  export type ConnectDragPreview = <T>(element: T | null) => T | null;
  export type ConnectDropTarget = <T>(element: T | null) => T | null;
} 
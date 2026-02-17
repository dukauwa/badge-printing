'use client';

import React from 'react';

interface ResizeHandlesProps {
  elementId: string;
  onResizeStart: (e: React.MouseEvent, elementId: string, handle: string) => void;
}

const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

export default function ResizeHandles({ elementId, onResizeStart }: ResizeHandlesProps) {
  return (
    <>
      {handles.map((handle) => (
        <div
          key={handle}
          className={`resize-handle ${handle}`}
          onMouseDown={(e) => onResizeStart(e, elementId, handle)}
        />
      ))}
    </>
  );
}

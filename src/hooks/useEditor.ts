"use client";

import { useCallback, useMemo, useState } from "react";
import { fabric } from "fabric";
import { useAutoResize } from "./useAutoResize";

const WORKSPACE_WIDTH = 900;
const WORKSPACE_HEIGHT = 1200;

const buildEditor = ({ canvas }: { canvas: fabric.Canvas }) => {
  const getWorkspace = () => {
    return canvas.getObjects().find((object) => object.name === "clip");
  };

  const center = (object: fabric.Object) => {
    const workspace = getWorkspace();
    const center = workspace?.getCenterPoint();

    if (center) {
      // @ts-ignore
      canvas._centerObject(object, center);
    } else {
      canvas.centerObject(object);
    }
  };

  const addToCanvas = (object: fabric.Object) => {
    canvas.add(object);
    center(object);
    canvas.setActiveObject(object);
  };

  return {
    addCircle: () => {
      const object = new fabric.Circle({
        radius: 225,
        left: 100,
        top: 100,
        fill: "rgba(0,0,0,1)",
        stroke:"rgba(0,0,0,1)",
        strokeWidth: 2, 
     });
      addToCanvas(object);
    },
    addImage: () => {
      fabric.Image.fromURL('https://res.cloudinary.com/dkysrpdi6/image/upload/v1710317497/ijkte1lttxyzroiop3dq.jpg', (img) => {
        img.scaleToWidth(300);
        addToCanvas(img);
      });
    },
    addText: (color: string = '#000000') => {
      const text = new fabric.IText('Edit this text', {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fill: color,
        fontSize: 30
      });
      addToCanvas(text);
    },
    enableDrawing: (color: string = '#000000') => {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = 5;
      canvas.freeDrawingBrush.color = color;
    },
    disableDrawing: () => {
      canvas.isDrawingMode = false;
    },
    
    setColor: (color: string) => {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          if (activeObject.type === 'i-text') {
            (activeObject as fabric.IText).set('fill', color);
          } else if (activeObject.type === 'circle' || activeObject.type === 'rect' || activeObject.type === 'triangle') {
            (activeObject as fabric.Object).set('fill', color);
          } else {
            activeObject.set('stroke', color);
          }
          canvas.renderAll();
        }
        if (canvas.isDrawingMode) {
          canvas.freeDrawingBrush.color = color;
        }
      },

    deleteSelected: () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
      }
    },
    onSelect: (callback: (selected: boolean) => void) => {
      canvas.on('selection:created', () => callback(true));
      canvas.on('selection:cleared', () => callback(false));
    }
  };
};

export const useEditor = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useAutoResize({
    canvas,
    container,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({ canvas });
    }
    return undefined;
  }, [canvas]);

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: fabric.Canvas;
      initialContainer: HTMLDivElement;
    }) => {
      fabric.Object.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3b82f6",
        borderScaleFactor: 1.5,
        borderOpacityWhenMoving: 1,
        transparentCorners: false,
        cornerStrokeColor: "#3b82f6",
      });

      const initialWorkspace = new fabric.Rect({
        width: WORKSPACE_WIDTH,
        height: WORKSPACE_HEIGHT,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        shadow: new fabric.Shadow({
          color: "rgba(0, 0, 0, 0.8)",
          blur: 5,
        }),
      });

      initialCanvas.setHeight(initialContainer.offsetHeight);
      initialCanvas.setWidth(initialContainer.offsetWidth);

      initialCanvas.add(initialWorkspace);
      initialCanvas.centerObject(initialWorkspace);
      initialCanvas.clipPath = initialWorkspace;

      setCanvas(initialCanvas);
      setContainer(initialContainer);

      const test = new fabric.Rect({
        height: 100,
        width: 100,
        fill: "black",
      });
      initialCanvas.add(test);
      initialCanvas.centerObject(test);

      initialCanvas.renderAll();
    },
    [],
  );

  return {
    init,
    editor,
  };
};


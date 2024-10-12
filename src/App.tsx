"use client";

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useEditor } from "./hooks/useEditor";

type ActiveTool = "nothing" | "circle" | "image" | "text" | "draw";

const App = () => {
  const { init, editor } = useEditor();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<ActiveTool>("nothing");
  const [color, setColor] = useState("#000000");
  const [isObjectSelected, setIsObjectSelected] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,
    });

    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current,
    });

    return () => {
      canvas.dispose();
    };
  }, [init]);

  useEffect(() => {
    if (editor) {
      editor.onSelect(setIsObjectSelected);
    }
  }, [editor]);

  const handleToolClick = (tool: ActiveTool) => {
    setActiveTool(tool);
    if (tool === "draw") {
      editor?.enableDrawing(color);
    } else {
      editor?.disableDrawing();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    editor?.setColor(newColor);
  };

  return (
    <div className="flex h-screen w-screen flex-col">
      <div className="relative flex h-full w-full overflow-hidden">
        <div className="tools flex flex-col gap-y-6 m-12">
          <button className={`p-2 rounded ${activeTool === "nothing" ? "bg-gray-300" : ""}`} onClick={() => handleToolClick("nothing")}>None</button>
          <button
            className={`p-2 rounded ${activeTool === "circle" ? "bg-gray-300" : ""}`}
            onClick={() => {
              handleToolClick("circle");
              editor?.addCircle();
            }}
          >
            Add Circle
          </button>
          <button
            className={`p-2 rounded ${activeTool === "image" ? "bg-gray-300" : ""}`}
            onClick={() => {
              handleToolClick("image");
              editor?.addImage();
            }}
          >
            Add Image
          </button>
          <button
            className={`p-2 rounded ${activeTool === "text" ? "bg-gray-300" : ""}`}
            onClick={() => {
              handleToolClick("text");
              editor?.addText(color);
            }}
          >
            Add Text
          </button>
          <button
            className={`p-2 rounded ${activeTool === "draw" ? "bg-gray-300" : ""}`}
            onClick={() => handleToolClick("draw")}
          >
            Draw
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="colorPicker">Color:</label>
            <input
              type="color"
              id="colorPicker"
              value={color}
              onChange={handleColorChange}
            />
          </div>
            <button
              className={`${!isObjectSelected? "bg-red-500/50" :" "} p-2 rounded bg-red-500 text-white`}
              onClick={() => editor?.deleteSelected()}
              disabled={isObjectSelected ? false : true}
            >
              Delete
            </button>
        </div>
     
        <main className="flex w-full flex-1 flex-col overflow-auto bg-secondary">
          <div className="canvas-container h-screen" ref={containerRef}>
            <canvas ref={canvasRef} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
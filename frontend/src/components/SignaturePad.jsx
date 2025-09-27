import React, { useRef, useEffect, useState } from 'react';

function SignaturePad({ onSignatureChange, width = 400, height = 200, penColor = '#000000', penWidth = 2 }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas properties
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = penColor;
    context.lineWidth = penWidth;
    
    // Set white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, [penColor, penWidth]);

  const getMousePosition = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (event) => {
    const canvas = canvasRef.current;
    const position = getMousePosition(canvas, event);
    
    setIsDrawing(true);
    setLastPosition(position);
    setIsEmpty(false);
  };

  const draw = (event) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const currentPosition = getMousePosition(canvas, event);

    context.beginPath();
    context.moveTo(lastPosition.x, lastPosition.y);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();

    setLastPosition(currentPosition);

    // Call the callback with the canvas data
    if (onSignatureChange) {
      const signatureDataURL = canvas.toDataURL('image/png');
      onSignatureChange(signatureDataURL);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Clear the canvas and set white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    setIsEmpty(true);
    
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  const getSignatureData = () => {
    if (isEmpty) return null;
    return canvasRef.current.toDataURL('image/png');
  };

  // Expose getSignatureData method through ref
  React.useImperativeHandle(canvasRef, () => ({
    getSignatureData,
    clearSignature
  }));

  return (
    <div style={{
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '10px',
      backgroundColor: 'white',
      display: 'inline-block'
    }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          cursor: 'crosshair',
          backgroundColor: 'white',
          borderRadius: '4px'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div style={{
        marginTop: '10px',
        textAlign: 'center'
      }}>
        <button
          onClick={clearSignature}
          style={{
            backgroundColor: '#666',
            color: 'white',
            border: '1px solid #888',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Clear Signature
        </button>
      </div>
    </div>
  );
}

export default SignaturePad;
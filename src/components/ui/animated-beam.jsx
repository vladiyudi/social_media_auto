import React, { useEffect, useRef } from "react";

export const AnimatedBeam = ({
  containerRef,
  nodes = [],
  centerRef,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!containerRef?.current || !canvasRef?.current || !centerRef?.current || !nodes?.length) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const center = centerRef.current;
    
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext('2d');
    let animationFrame;
    let progress = 0;

    const drawBeam = (startX, startY, endX, endY, progress, isLeft) => {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 + Math.sin(progress) * 0.05})`;
      ctx.lineWidth = 2;
      
      const dx = endX - startX;
      const dy = endY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const curveIntensity = distance * 0.5;
      const direction = isLeft ? 1 : -1;
      
      const cp1x = startX + (dx * 0.25) + (direction * curveIntensity);
      const cp1y = startY + (dy * 0.25);
      const cp2x = startX + (dx * 0.75) + (direction * curveIntensity);
      const cp2y = startY + (dy * 0.75);
      
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
      ctx.stroke();
      
      ctx.shadowBlur = 5;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      
      const particleCount = 3;
      for (let i = 0; i < particleCount; i++) {
        const t = ((progress * 2) + (i / particleCount)) % 1;
        const px = Math.pow(1 - t, 3) * startX + 
                  3 * Math.pow(1 - t, 2) * t * cp1x + 
                  3 * (1 - t) * Math.pow(t, 2) * cp2x + 
                  Math.pow(t, 3) * endX;
        const py = Math.pow(1 - t, 3) * startY + 
                  3 * Math.pow(1 - t, 2) * t * cp1y + 
                  3 * (1 - t) * Math.pow(t, 2) * cp2y + 
                  Math.pow(t, 3) * endY;
                  
        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * Math.sin(progress * 2 + i)})`;
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const animate = () => {
      if (!container || !center) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      progress += 0.005;

      const centerRect = center.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      const centerX = centerRect.left - containerRect.left + centerRect.width / 2;
      const centerY = centerRect.top - containerRect.top + centerRect.height / 2;

      nodes.forEach(node => {
        if (!node?.ref?.current) return;
        
        const rect = node.ref.current.getBoundingClientRect();
        const startX = rect.left - containerRect.left + rect.width / 2;
        const startY = rect.top - containerRect.top + rect.height / 2;
        
        const isLeft = startX < centerX;
        drawBeam(startX, startY, centerX, centerY, progress + Math.random(), isLeft);
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [containerRef, nodes, centerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
};

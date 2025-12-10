import React, { useState } from 'react';
import Experience from './components/Experience';
import { ParticleState, ShapeType } from './types';

const App: React.FC = () => {
  const [currentShape, setCurrentShape] = useState<ShapeType>('heart');
  const [primaryColor, setPrimaryColor] = useState<string>('#00d2ff');
  const [particleState, setParticleState] = useState<ParticleState>({
    handState: 'WAITING',
    scaleFactor: 1.0,
    isDetected: false,
  });

  const shapes: { id: ShapeType; label: string }[] = [
    { id: 'heart', label: 'Heart' },
    { id: 'flower', label: 'Rose' },
    { id: 'saturn', label: 'Saturn' },
    { id: 'buddha', label: 'Zen' },
    { id: 'firework', label: 'Burst' },
    { id: 'helix', label: 'Helix' },
  ];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white select-none">
      
      {/* 3D Scene Background */}
      <Experience 
        currentShape={currentShape} 
        primaryColor={primaryColor}
        onStateChange={setParticleState}
        config={{
            particleCount: 20000,
            particleSize: 0.08,
            photoCount: 50, // How many photo sprites to mix in
            transitionSpeed: 0.08,
            handSensitivity: 0.1,
        }}
      />

      {/* Main UI Overlay - Glassmorphism */}
      <div className="absolute top-6 right-6 w-80 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl z-10 transition-all duration-300">
        
        <div className="mb-6 border-b border-white/10 pb-4">
            <h1 className="text-xl font-light tracking-widest uppercase text-white/90">Memory Cloud</h1>
            <p className="text-xs text-white/40 mt-1">Interactive Gesture Gallery</p>
        </div>

        {/* Status Monitor */}
        <div className="mb-6 flex items-center justify-between bg-black/20 p-3 rounded-lg">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase text-white/40 tracking-wider">System Status</span>
                <span className={`text-sm font-bold ${particleState.isDetected ? 'text-green-400' : 'text-amber-400'}`}>
                    {particleState.isDetected ? 'LINKED' : 'SEARCHING...'}
                </span>
            </div>
             <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase text-white/40 tracking-wider">Expansion</span>
                <span className="text-sm font-mono text-cyan-400">{(particleState.scaleFactor * 100).toFixed(0)}%</span>
            </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
            
            {/* Shapes */}
            <div>
                <label className="block text-xs uppercase text-white/40 mb-3 tracking-wider">Geometry Model</label>
                <div className="grid grid-cols-2 gap-2">
                    {shapes.map((shape) => (
                        <button
                            key={shape.id}
                            onClick={() => setCurrentShape(shape.id)}
                            className={`
                                py-2 px-3 text-xs rounded-md border transition-all duration-200
                                ${currentShape === shape.id 
                                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                                    : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/20'
                                }
                            `}
                        >
                            {shape.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color */}
            <div>
                 <label className="block text-xs uppercase text-white/40 mb-3 tracking-wider">Theme Spectrum</label>
                 <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                    <input 
                        type="color" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0 appearance-none" 
                    />
                    <span className="text-xs text-white/50 font-mono">{primaryColor.toUpperCase()}</span>
                 </div>
            </div>

            {/* Hint */}
            <div className="mt-8 pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-white/40 leading-relaxed">
                    Raise your hand. <br/>
                    <span className="text-cyan-400">Pinch</span> to condense memories. <br/>
                    <span className="text-cyan-400">Open palm</span> to expand and reveal photos.
                </p>
            </div>

        </div>
      </div>

      {/* Futuristic Webcam Preview (No Green Lines) */}
      <div className="absolute bottom-6 left-6 w-48 h-36 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/50 backdrop-blur-sm z-10">
         <video 
            ref={(el) => {
                if(el) {
                    // Mirror the local webcam for the user UI (separate from the hidden analysis video)
                    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
                    .then(stream => el.srcObject = stream);
                }
            }}
            autoPlay 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-60 transform -scale-x-100 mix-blend-screen"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none" />
         <div className="absolute bottom-2 left-3 text-[10px] text-cyan-500/80 font-mono tracking-widest">CAM_FEED_01</div>
      </div>

    </div>
  );
};

export default App;
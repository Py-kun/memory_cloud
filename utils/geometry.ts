import { ShapeType } from '../types';

export interface Point3D {
    x: number;
    y: number;
    z: number;
}

export const getPointOnShape = (type: ShapeType, idx: number, total: number): Point3D => {
    // Random variables
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    let x = 0, y = 0, z = 0;

    switch (type) {
        case 'heart': {
            const t = theta;
            x = 16 * Math.pow(Math.sin(t), 3);
            y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            z = (Math.random() - 0.5) * 8; 
            
            // Fill volume
            const scale = Math.cbrt(Math.random());
            x *= scale; y *= scale; z *= scale;
            
            // Scale down to fit view
            x *= 0.35; y *= 0.35; z *= 0.35;
            break;
        }

        case 'flower': {
            const k = 3; 
            const rBase = 10 * Math.cos(k * theta) + 5;
            const rVol = rBase * Math.random();
            
            x = rVol * Math.cos(theta);
            y = rVol * Math.sin(theta);
            z = (Math.random() - 0.5) * 5 * (1 - rVol/15);
            z += Math.cos(theta * k) * 2;
            
            x *= 0.6; y *= 0.6; z *= 0.6;
            break;
        }

        case 'saturn': {
            if (Math.random() > 0.4) {
                // Planet
                const r = 6 * Math.cbrt(Math.random());
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);
            } else {
                // Ring
                const rInner = 8;
                const rOuter = 16;
                const r = Math.sqrt(Math.random() * (rOuter*rOuter - rInner*rInner) + rInner*rInner);
                x = r * Math.cos(theta);
                z = r * Math.sin(theta);
                y = (Math.random() - 0.5) * 0.5;
                
                // Tilt
                const tilt = 0.4;
                const yt = y * Math.cos(tilt) - z * Math.sin(tilt);
                const zt = y * Math.sin(tilt) + z * Math.cos(tilt);
                y = yt; z = zt;
            }
            break;
        }

        case 'buddha': {
             const dice = Math.random();
            if (dice < 0.15) {
                // Head
                const r = 2.5 * Math.cbrt(Math.random());
                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta) + 6;
                z = r * Math.cos(phi);
            } else if (dice < 0.55) {
                // Body
                const r = 4.0 * Math.cbrt(Math.random());
                x = r * Math.sin(phi) * Math.cos(theta);
                y = (r * Math.sin(phi) * Math.sin(theta)) * 1.2; 
                z = r * Math.cos(phi) * 0.8;
            } else {
                // Base
                const r = 5.5 * Math.sqrt(Math.random());
                x = r * Math.cos(theta);
                z = r * Math.sin(theta) * 0.7;
                y = (Math.random() - 1) * 2 - 3;
            }
            break;
        }

        case 'firework': {
            const r = 15 * Math.cbrt(Math.random());
            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);
            if (Math.random() > 0.9) {
                x *= 1.8; y *= 1.8; z *= 1.8;
            }
            break;
        }
        
        case 'helix': {
            const t = idx * 0.1;
            const r = 5;
            x = r * Math.cos(t);
            y = (idx / total) * 20 - 10;
            z = r * Math.sin(t);
            // Add noise
            x += (Math.random() - 0.5);
            z += (Math.random() - 0.5);
            break;
        }

        default:
            x = 0; y = 0; z = 0;
    }

    return { x, y, z };
};
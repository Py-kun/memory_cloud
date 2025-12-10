export type ShapeType = 'heart' | 'flower' | 'saturn' | 'buddha' | 'firework' | 'helix';

export interface ParticleState {
    handState: 'CLOSED' | 'OPEN' | 'MOVING' | 'WAITING';
    scaleFactor: number;
    isDetected: boolean;
}

export interface AppConfig {
    particleCount: number;
    particleSize: number;
    photoCount: number;
    transitionSpeed: number;
    handSensitivity: number;
}
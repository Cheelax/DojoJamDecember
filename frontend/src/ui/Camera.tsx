import { useTick } from '@pixi/react';
import { Coordinate } from '../type/GridElement';

interface CameraProps {
    cameraOffset: Coordinate,
    targetCameraOffset: Coordinate,
    setCameraOffset: Function
}

function lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
}  

const Camera: React.FC<CameraProps> = ({ cameraOffset, targetCameraOffset, setCameraOffset }) => {
    useTick(() => {
        const currentX = cameraOffset.x;
        const currentY = cameraOffset.y;
        const targetX = targetCameraOffset.x;
        const targetY = targetCameraOffset.y;
        if (Math.abs(targetX - currentX) >= 1 || Math.abs(targetY - currentY) >= 1) {
            const newX = lerp(currentX, targetX, 0.05);
            const newY = lerp(currentY, targetY, 0.05);
            setCameraOffset({ x: newX, y: newY });
        }
    })
    return <></>
};

export default Camera;
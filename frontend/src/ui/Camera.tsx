import { useTick } from "@pixi/react";
import { useEffect, useState } from "react";
import { Coordinate } from "../type/GridElement";
import { HEIGHT, WIDTH } from "../utils/grid";

interface CameraProps {
    setCameraOffset: any;
    pointerPosition: any;
}
  
const Camera: React.FC<CameraProps> = ({ setCameraOffset, pointerPosition }) => {
    const [keys, setKeys] = useState({ z: false, q: false, s: false, d: false })
    const [cameraDirection, setCameraDirection] = useState({ up: false, right: false, down: false, left: false })
    const handleKeyDown = (event: any) => {
        for (const key in keys) {
            if (event.key === key || event.key === key.toUpperCase()) {
                setKeys((prevKeys) => { return { ...prevKeys, [key]: true } })
            }
        }
    };

    const handleKeyUp = (event: any) => {
        for (const key in keys) {
            if (event.key === key || event.key === key.toUpperCase()) {
                setKeys((prevKeys) => { return { ...prevKeys, [key]: false } })
            }
        }
    };
    
    useEffect(() => {
        setCameraDirection(() => { return {
            left: pointerPosition.nativeEvent.offsetX < 60 || keys.q,
            right: pointerPosition.nativeEvent.offsetX > WIDTH - 60 || keys.d,
            up: pointerPosition.nativeEvent.offsetY < 60 || keys.z,
            down: pointerPosition.nativeEvent.offsetY > HEIGHT - 60 || keys.s
        }})
    }, [pointerPosition, keys])

    const speed = 10
    useTick((delta: number) => {
        const offset = { x: 0, y: 0 }
        if (cameraDirection.right) offset.x = speed * delta;
        if (cameraDirection.left) offset.x = -speed * delta;
        if (cameraDirection.down) offset.y = speed * delta;
        if (cameraDirection.up) offset.y = -speed * delta;
        if (offset.x === 0 && offset.y === 0) return
        setCameraOffset((prevValue: Coordinate) => { return { x: prevValue.x + offset.x, y: prevValue.y + offset.y } })
    })

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
    return (<></>)
}

export default Camera;
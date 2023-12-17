import { useTick } from "@pixi/react";
import { useEffect, useState } from "react";
import { Coordinate } from "../type/GridElement";

interface CameraProps {
    setCameraOffset: any;
}
  
const Camera: React.FC<CameraProps> = ({ setCameraOffset }) => {
  const [keys, setKeys] = useState({ z: false, q: false, s: false, d: false })
  const handleKeyDown = (event: any) => {
    if (event.key === 'z' || event.key === 'Z') {
      setKeys((prevKeys) => { return { ...prevKeys, z: true } })
    }
    if (event.key === 'q' || event.key === 'Q') {
      setKeys((prevKeys) => { return { ...prevKeys, q: true } })
    }
    if (event.key === 's' || event.key === 'S') {
      setKeys((prevKeys) => { return { ...prevKeys, s: true } })
    }
    if (event.key === 'd' || event.key === 'D') {
      setKeys((prevKeys) => { return { ...prevKeys, d: true } })
    }
  };

  const handleKeyUp = (event: any) => {
    if (event.key === 'z' || event.key === 'Z') {
      setKeys((prevKeys) => { return { ...prevKeys, z: false } })
    }
    if (event.key === 'q' || event.key === 'Q') {
      setKeys((prevKeys) => { return { ...prevKeys, q: false } })
    }
    if (event.key === 's' || event.key === 'S') {
      setKeys((prevKeys) => { return { ...prevKeys, s: false } })
    }
    if (event.key === 'd' || event.key === 'D') {
      setKeys((prevKeys) => { return { ...prevKeys, d: false } })
    }
  };

  const speed = 10
  useTick((delta: number) => {
    const offset = { x: 0, y: 0 }
    if (keys.d) offset.x = speed * delta;
    if (keys.q) offset.x = -speed * delta;
    if (keys.s) offset.y = speed * delta;
    if (keys.z) offset.y = -speed * delta;
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
    return (
        <></>
    )
}

export default Camera;
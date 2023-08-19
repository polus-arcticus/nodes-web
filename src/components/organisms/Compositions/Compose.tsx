import { useState, useEffect, useCallback, Dispatch, SetStateAction, useRef, MutableRefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrthographicCamera, MapControls } from '@react-three/drei';
import * as THREE from 'three'
import { useNodeReader } from '@src/state/nodes/hooks';
import { useGetNodesQuery } from '@src/state/api/nodes';
import { animated } from '@react-spring/three'
import { useSpring } from '@react-spring/web'
import { useDrag, Vector2 } from '@use-gesture/react'

const CompositionNodeCard = ({
    nodeCid,
    colour,
    setIsDragging,
    floorPlane,
    aspectRef
}: {
    nodeCid: string,
    colour: string,
    setIsDragging: Dispatch<SetStateAction<boolean>>,
    floorPlane: THREE.Plane,
    aspectRef: MutableRefObject<null>
}) => {
    //const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

    const [pos, setPos] = useState([0, 0, 0]);
    const { size, viewport } = useThree();
    const aspect = size.width / viewport.width;
    let planeIntersectPoint = new THREE.Vector3();

    const [spring, set] = useSpring(() => ({
        // position: [0, 0, 0],
        position: pos,
        scale: 1,
        rotation: [0, 0, 0],
        config: { friction: 1 }
    }));
    const init:Vector2 = spring.position.get()

    const bind = useDrag(
        ({
            active,
            movement: [xMovement, yMovement],
            first,
            memo = { initialTranslateX: 0, initialTranslateY: 0 },
            canceled
        }) => {
            setIsDragging(active)
            const [translateX, translateY] = spring.position.get();
            if (first) {
                return {
                    initialTranslateX: translateX,
                    initialTranslateY: translateY
                };
            }
            set({
                position: [
                    memo.initialTranslateX + xMovement / aspectRef.current,
                    memo.initialTranslateY - yMovement / aspectRef.current,
                    0
                ]
            });
            return memo;
        },
        {
            eventOptions: { passive: false },
            from: init,
            window
        }
    )
    return (
        <animated.mesh {...spring} {...bind()}>
            <planeGeometry
                attach="geometry"
                args={[1, 1]}
            />
            <meshStandardMaterial color={colour} attach="material" transparent />
        </animated.mesh>)
}
export const Compose = () => {
    const { data: nodes, isLoading } = useGetNodesQuery();
    const [isDragging, setIsDragging] = useState(false)
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);
    const aspectRef = useRef(null);

    useEffect(() => {
        console.log(isLoading, 'isLoading')
        if (!isLoading) {
            console.log(nodes)
        }
    }, [isLoading])
    return (<>
        <Canvas
            onCreated={({ aspect, size, viewport }) => {
                aspectRef.current = viewport.factor;
            }}
            style={{ height: '100vh', width: '100vw' }}
            camera={{ position: [0, 0, 5], zoom: 1, up: [0, 0, 1], far: 10000 }}
        >
            <ambientLight intensity={0.5} />
            <planeHelper args={[floorPlane, '30', 'red']} />
            <CompositionNodeCard nodeCid="hi" colour="blue" setIsDragging={setIsDragging} floorPlane={floorPlane} aspectRef={aspectRef} />
            <MapControls makeDefault enabled={!isDragging} />
        </Canvas>
    </>)
}
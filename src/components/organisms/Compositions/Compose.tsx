import { useState, useEffect, useCallback, Dispatch, SetStateAction, useRef, MutableRefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrthographicCamera, MapControls } from '@react-three/drei';
import * as THREE from 'three'
import { useNodeReader } from '@src/state/nodes/hooks';
import { useGetNodesQuery } from '@src/state/api/nodes';
import { animated } from '@react-spring/three'
import { useSpring } from '@react-spring/web'
import { useDrag, Vector2 } from '@use-gesture/react'

import TooltipIcon from "@components/atoms/TooltipIcon";
import { IconAdd } from "@icons";
const CompositionNodeCard = ({
    nodeCid,
    colour,
    setIsDragging,
    floorPlane,
    aspectRef,
    activeNode,
    setActiveNode
}: {
    nodeCid: string,
    colour: string,
    setIsDragging: Dispatch<SetStateAction<boolean>>,
    floorPlane: THREE.Plane,
    aspectRef: MutableRefObject<null>,
    activeNode: string | null,
    setActiveNode: Dispatch<SetStateAction<string | null>>
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
    }));
    const init: Vector2 = spring.position.get()

    const bind = useDrag(
        ({
            args = [nodeCid],
            event,
            active,
            movement: [xMovement, yMovement],
            first,
            memo = { initialTranslateX: 0, initialTranslateY: 0 },
            canceled
        }) => {
            event.stopPropagation()
            if (active && activeNode === nodeCid) {
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
            }
            if (!active) {
                setActiveNode(null)
                setIsDragging(false)
            }
            return memo;
        },
        {
            eventOptions: { passive: false },
            from: init,
            window
        }
    )
    return (
        <animated.mesh
            onClick={(event) => {
                event.stopPropagation()
                setActiveNode(nodeCid)
            }}
            {...spring} {...bind()}>
            <planeGeometry
                attach="geometry"
                args={[1, 1]}
            />
            <meshStandardMaterial color={colour} attach="material" transparent />
        </animated.mesh>
    )
}
const AddNodeModal = () => {
    return (<>
    </>)
}
const AddNodeButton = () => {
    const [showAddModal, setShowAddModal] = useState(false)

    const toggleAddModal = () => {
        setShowAddModal(old => !old)
    }
    return (
        <div className="fixed top-[50px] left-[58px] z-0">
            <div className="rounded-full w-[50px] h-fit py-2 text-white fill-current bg-black m-8 flex items-center justify-center flex-col gap-3 drop-shadow-lg shadow-lg">
                <TooltipIcon
                    id="add-component-button"
                    placement="bottom"
                    tooltip="Add component"
                    key={"tooltip-component-add"}
                    tipClassName="w-36"
                    offset={{ left: 10, top: 80 }}
                    icon={
                        <div
                            className="bg-tint-primary hover:bg-tint-primary-dark cursor-pointer w-8 h-8 rounded-full flex items-center justify-center"
                            onClick={() => {
                                toggleAddModal()
                                //lockScroll();
                                //setAddFilesWithoutContext(true);
                                //setIsAddingComponent(true);
                                //postUserAction(AvailableUserActionLogTypes.btnAddComponentFab);
                            }}
                        >
                            <IconAdd width={18} height={18} stroke="black" />
                        </div>
                    }
                />
            </div>
        </div>)
}
export const Compose = () => {
    const { data: nodes, isLoading } = useGetNodesQuery();
    const [activeNode, setActiveNode] = useState<string | null>("")
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
        <AddNodeButton />
        <Canvas
            onCreated={({ aspect, size, viewport }) => {
                aspectRef.current = viewport.factor;
            }}
            style={{ height: '100vh', width: '100vw' }}
            camera={{ position: [0, 0, 5], zoom: 1, up: [0, 0, 1], far: 10000 }}
        >
            <ambientLight intensity={0.5} />
            <planeHelper args={[floorPlane, 1000, 'red']} />
            <CompositionNodeCard nodeCid="hi" activeNode={activeNode} setActiveNode={setActiveNode} colour="blue" setIsDragging={setIsDragging} floorPlane={floorPlane} aspectRef={aspectRef} />
            <CompositionNodeCard nodeCid="there" activeNode={activeNode} setActiveNode={setActiveNode} colour="green" setIsDragging={setIsDragging} floorPlane={floorPlane} aspectRef={aspectRef} />
            <MapControls makeDefault enabled={!isDragging} />
        </Canvas>
    </>)
}
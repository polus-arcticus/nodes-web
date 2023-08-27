import { useState, useEffect, useCallback, Dispatch, SetStateAction, useRef, MutableRefObject } from 'react'
import { ThreeEvent } from '@react-three/fiber';
import { Canvas, useThree } from '@react-three/fiber'
import { OrthographicCamera, MapControls, Html } from '@react-three/drei';
import * as THREE from 'three'
import { useNodeReader } from '@src/state/nodes/hooks';
import { useGetNodesQuery } from '@src/state/api/nodes';
import { ResearchNode } from '@src/state/api/types';
import { animated } from '@react-spring/three'
import { a, useSpring } from '@react-spring/web'
import { useDrag, Vector2 } from '@use-gesture/react'
import PopOver from "@components/organisms/PopOver";
import TooltipIcon from "@components/atoms/TooltipIcon";
import { IconAdd } from "@icons";
import NodeCard from "@components/molecules/NodeCard";
const CompositionNodeCard = ({
    node,
    colour,
    setIsDragging,
    floorPlane,
    aspectRef,
    //activeNode,
    //setActiveNode
}: {
    node: ResearchNode,
    colour: string,
    setIsDragging: Dispatch<SetStateAction<boolean>>,
    floorPlane: THREE.Plane,
    aspectRef: MutableRefObject<null>,
    //</null>activeNode: string | null,
    //</SetStateAction>setActiveNode: Dispatch<SetStateAction<string | null>>
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
            args = [node.uuid],
            event,
            active,
            movement: [xMovement, yMovement],
            first,
            memo = { initialTranslateX: 0, initialTranslateY: 0 },
            canceled
        }) => {
            event.stopPropagation()
            if (active) {
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
                //setActiveNode(null)
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
                console.log('click mesh')
                console.log(node.uuid, 'node.uuid')
                //setActiveNode(node.uuid)
                console.log('trying to set activenode', activeNode)
                event.stopPropagation()
            }}
            {...spring} {...bind()}>
            <Html
            distanceFactor={10}
            style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gridTemplateRows: 'repeat(3,1fr)',

            }}
            >
                <p  style={{display: 'grid', gridRow: 1, gridColumn: 1}} className="text-white">{node.title}</p>
            </Html>
            <planeGeometry
                attach="geometry"
                args={[3, 5]}
            />
            <meshStandardMaterial color={colour} attach="material" transparent />
        </animated.mesh>
    )
}
const AddNodeModal = ({
    showAddModal,
    setShowAddModal,
    handleAddNode
}: {
    showAddModal: boolean,
    setShowAddModal: Dispatch<SetStateAction<boolean>>,
    handleAddNode: (node: ResearchNode) => void
}) => {
    // get list of local nodes

    const { data: nodes, isLoading } = useGetNodesQuery();
    // display as options to put into canvas
    // place to enter dpid for an external desci node
    // a little 'explore popular repositories' option 
    return (<PopOver
        isVisible={showAddModal}
        className="transition-all rounded-lg bg-zinc-100 dark:bg-zinc-900 p-2"
        onClose={() => setShowAddModal(old => !old)}
    >
        <div className="text-white font-bold text-[21px] leading-[27px] py-2 text-center">
            Add a Local Desci Node
        </div>
        {nodes && nodes?.map((node, i) => {
            return (<div key={`node-card-sidepanel-${node.uuid}`}
             className='py-1'>
                <NodeCard
                    {...node}
                    node={node}
                    onClick={() => {
                        handleAddNode(node)
                        //dispatch(setPublicView(false));
                        //const targetUrl = `${site.app}${app.nodes}/${RESEARCH_OBJECT_NODES_PREFIX}${node.uuid}`;

                        setTimeout(() => {
                            //navigate(targetUrl);
                            // console.log("navigate", targetUrl);
                            //setIsAddingComponent(false);
                            //etIsAddingSubcomponent(false);
                            //dispatch(toggleResearchPanel(true));
                        });
                        //onClose();
                    }}
                />
                </div>
            )
        })}
    </PopOver>
    )
}
const AddNodeButton = ({
    showAddModal,
    setShowAddModal
}: {
    showAddModal: boolean,
    setShowAddModal: Dispatch<SetStateAction<boolean>>
}) => {
    return (
        <div className="fixed top-[50px] left-[58px] z-10">
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
                                setShowAddModal(old => !old)

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
    //const [activeNode, setActiveNode] = useState<string | null>("")
    const [isDragging, setIsDragging] = useState(false)
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);
    const aspectRef = useRef(null);

    const [showAddModal, setShowAddModal] = useState(false)

    const toggleAddModal = () => {
        setShowAddModal(old => !old)
    }
    const [nodeCards, setNodeCards] = useState<JSX.Element[] | never>([])
    const handleAddNode = (node:ResearchNode) => {
        console.log('handlingaddnode')
        setNodeCards(old => [...old,
            <CompositionNodeCard
                key={node.uuid}
                node={node}
                colour="#0d1117"
                setIsDragging={setIsDragging}
                floorPlane={floorPlane}
                aspectRef={aspectRef}
            /> 
        ])
    }

    useEffect(() => {
        console.log(isLoading, 'isLoading')
        if (!isLoading) {
            console.log(nodes)
        }
    }, [isLoading])
    return (<>
        <AddNodeButton showAddModal={showAddModal} setShowAddModal={setShowAddModal} />
        <AddNodeModal handleAddNode={handleAddNode} showAddModal={showAddModal} setShowAddModal={setShowAddModal} />
        <Canvas

            onCreated={({ aspect, size, viewport }) => {
                aspectRef.current = viewport.factor;
            }}
            style={{ height: '100vh', width: '100vw', zIndex: '1' }}
            camera={{ position: [0, 0, 5], zoom: 1, up: [0, 0, 1], far: 10000 }}
        >
            <ambientLight intensity={0.5} />
            <planeHelper args={[floorPlane, 1000, '#444444']} />
            {nodeCards && nodeCards}
            <MapControls makeDefault enabled={!isDragging} />
        </Canvas>
    </>)
}
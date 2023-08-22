import { useState, useEffect, useCallback, Dispatch, SetStateAction, useRef, MutableRefObject } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrthographicCamera, MapControls } from '@react-three/drei';
import * as THREE from 'three'
import { useNodeReader } from '@src/state/nodes/hooks';
import { useGetNodesQuery } from '@src/state/api/nodes';
import { animated } from '@react-spring/three'
import { useSpring } from '@react-spring/web'
import { useDrag, Vector2 } from '@use-gesture/react'
import PopOver from "@components/organisms/PopOver";
import TooltipIcon from "@components/atoms/TooltipIcon";
import { IconAdd } from "@icons";
import NodeCard from "@components/molecules/NodeCard";
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
const AddNodeModal = ({
    showAddModal,
    setShowAddModal,
    handleAddNode
}: {
    showAddModal: boolean,
    setShowAddModal: Dispatch<SetStateAction<boolean>>,
    handleAddNode: () => void
}) => {
    // get list of local nodes

    const { data: nodes, isLoading } = useGetNodesQuery();
    console.log('mhhhmmmm')
    // display as options to put into canvas
    // place to enter dpid for an external desci node
    // a little 'explore popular repositories' option 
    return (<PopOver
        style={{
            display: 'absolute',
            top: '0',
            left: '0',
            backgroundColor: "#3A3A3ABF",
        }}
        isVisible={showAddModal}
        className="transition-all rounded-lg bg-zinc-100 dark:bg-zinc-900"
        onClose={() => setShowAddModal(old => !old)}
    >
        <p>Add a Local Desci Node</p>
        {nodes && nodes?.map((node, i) => {
            return (
          <NodeCard
            {...node}
            node={node}
            key={`node-card-sidepanel-${node.uuid}`}
            onClick={() => {
              console.log('clicked')
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
                                console.log('hi')
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
    const [activeNode, setActiveNode] = useState<string | null>("")
    const [isDragging, setIsDragging] = useState(false)
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 0, 0), 0);
    const aspectRef = useRef(null);
    
    const [showAddModal, setShowAddModal] = useState(false)

    const toggleAddModal = () => {
        setShowAddModal(old => !old)
    }
    const [nodeCards, setNodeCards] = useState<JSX.Element[] | never >([])
    const handleAddNode = () => {
        nodeCards?.push(
            <CompositionNodeCard nodeCid="hi" activeNode={activeNode} setActiveNode={setActiveNode} colour="blue" setIsDragging={setIsDragging} floorPlane={floorPlane} aspectRef={aspectRef} />
        )
    }

    useEffect(() => {
        console.log(isLoading, 'isLoading')
        if (!isLoading) {
            console.log(nodes)
        }
    }, [isLoading])
    return (<>
        <AddNodeButton showAddModal={showAddModal} setShowAddModal={setShowAddModal}/>
        <AddNodeModal handleAddNode={handleAddNode} showAddModal={showAddModal} setShowAddModal={setShowAddModal}/>
        <Canvas

            onCreated={({ aspect, size, viewport }) => {
                aspectRef.current = viewport.factor;
            }}
            style={{ height: '100vh', width: '100vw', zIndex:'1' }}
            camera={{ position: [0, 0, 5], zoom: 1, up: [0, 0, 1], far: 10000 }}
        >
            <ambientLight intensity={0.5} />
            <planeHelper args={[floorPlane, 1000, 'red']} />
            {nodeCards && nodeCards}
            <CompositionNodeCard nodeCid="hi" activeNode={activeNode} setActiveNode={setActiveNode} colour="blue" setIsDragging={setIsDragging} floorPlane={floorPlane} aspectRef={aspectRef} />
            <CompositionNodeCard nodeCid="there" activeNode={activeNode} setActiveNode={setActiveNode} colour="green" setIsDragging={setIsDragging} floorPlane={floorPlane} aspectRef={aspectRef} />
            <MapControls makeDefault enabled={!isDragging} />
        </Canvas>
    </>)
}
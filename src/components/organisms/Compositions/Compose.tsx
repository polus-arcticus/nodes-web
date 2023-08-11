import { useState, useEffect, useCallback} from 'react'
import {Canvas} from '@react-three/fiber'
import { OrthographicCamera, MapControls } from '@react-three/drei';
import * as THREE from 'three'
import { useNodeReader } from '@src/state/nodes/hooks';
import { useGetNodesQuery } from '@src/state/api/nodes';
export const Compose = () => {
    const floorPlane = new THREE.Plane(new THREE.Vector3(0,0,0), 0);

    const { data: nodes, isLoading } = useGetNodesQuery();

    useEffect(() => {
        console.log(isLoading, 'isLoading')
        if (!isLoading) {
        console.log(nodes)
        }
    }, [isLoading])
    return (<>
    <Canvas 
        style={{height:'100%', width:'100%'}}
        camera={{ position: [0, 0, 5], zoom: 1, up: [0, 0, 1], far: 10000 }}
    >
            <ambientLight intensity={0.5} />
            <planeHelper args={[floorPlane, 10, "grey"]} />
            <MapControls makeDefault />
    </Canvas> 
    </>)
}
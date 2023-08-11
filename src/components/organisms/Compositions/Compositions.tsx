import { IconNodeCollection, IconPiGraphFill } from "@icons";
import PrimaryButton from "@components/atoms/PrimaryButton";
import PerfectScrollbar from "react-perfect-scrollbar";
import NodeCardLoader from "@src/components/molecules/NodeCardLoader";

import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useGetter, useSetter } from "@src/store/accessors";

import { AvailableUserActionLogTypes, postUserAction } from "@src/api";
import { CreateCompositionModal } from "./CreateCompositionModal";
const ComposeCollectionLoader = () => (
    <div className="max-w-2xl w-full self-center flex flex-col gap-6 animate-pulse h-full pb-10">
        {[1, 2, 3, 4, 5, 6, 7].map((i: number) => (
            <NodeCardLoader key={`node-card-sidepanel-loader-${i}`} />
        ))}
    </div>
);


export const Compositions = () => {
    // "useGetCompositionsQuery"
  //const { data: nodes, isLoading } = useGetNodesQuery();

  const { showAddNewComposition, setIsAddingComponent, setIsAddingSubcomponent, setShowAddNewComposition } =
    useManuscriptController(["showAddNewComposition"]);
  const dispatch = useSetter();
    return (
        <div
            className={`h-screen w-screen fixed left-0 pt-3 sm:pl-16 sm:pt-14 top-0 z-[102] will-change-transform transition-opacity duration-150 bg-neutrals-black opacity-100`}
        >
            <div className="flex flex-col pt-20 h-full">
                <div className="flex gap-5 sm:gap-0 flex-col max-w-full sm:flex-row mx-auto pb-5 border-b border-neutrals-gray-3 mb-5 sm:max-w-2xl w-full justify-between items-center">
                    <div className="flex items-center gap-3">
                        <IconPiGraphFill
                            width={42}
                            height={42}
                            className="scale-75 sm:scale-100"
                        />
                        <div>
                            <div className="text-white font-bold text-[21px] leading-[27px]">
                                My Compositions
                            </div>
                            <div className="text-neutrals-gray-5 text-sm hidden sm:block">
                                Below is a list of your compositions
                            </div>
                        </div>
                    </div>
                    <PrimaryButton
                        onClick={() => {
                            //dispatch(setPublicView(false))
                            //dispatch(setPublicView(false));
                            setShowAddNewComposition(true);
                            postUserAction(AvailableUserActionLogTypes.btnAddComposition);
                        }}
                        className="h-10 text-lg"
                    >
                        Create New Composition
                    </PrimaryButton>
                </div>
                {/*
                <PerfectScrollbar className="overflow-y-scroll w-full justify-center flex h-full px-4 sm:px-0">
                    {isLoading ? <NodeCollectionLoader /> : <LoadedNodesCollection />}
                </PerfectScrollbar>
               */}
                <CreateCompositionModal
                    isOpen={showAddNewComposition}
                    onDismiss={() => setShowAddNewComposition(false)}
                />
            </div>
        </div>

    )
}
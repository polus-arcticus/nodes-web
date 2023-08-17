import { IconNodeCollection, IconPiGraphFill } from "@icons";
import PrimaryButton from "@components/atoms/PrimaryButton";
import PerfectScrollbar from "react-perfect-scrollbar";
import CompositionCardLoader from "@src/components/molecules/CompositionCardLoader";
import CompositionCard from "@components/molecules/CompositionCard";
import { useManuscriptController } from "@src/components/organisms/ManuscriptReader/ManuscriptController";
import { useGetter, useSetter } from "@src/store/accessors";
import { useNavigate } from "react-router";
import { useGetCompositionsQuery } from "@src/state/api/compositions";
import { AvailableUserActionLogTypes, postUserAction } from "@src/api";
import { CreateCompositionModal } from "./CreateCompositionModal";

import { app, site } from "@src/constants/routes";

const CompositionCollectionEmptyState = () => <div className="flex-1 max-w-2xl w-full self-center flex justify-center items-center gap-6 pb-10">
    <div className="max-w-sm">
        <div className="text-base text-center font-bold text-white my-2">
            Connect shrubberiees of knowlege
        </div>
        <div className="text-sm text-center text-neutrals-gray-5">
            Select the “Create Composition” button above to begin connecting desci nodes together for new insights
        </div>
    </div>
</div>
const CompositionCollectionLoader = () => (
    <div className="max-w-2xl w-full self-center flex flex-col gap-6 animate-pulse h-full pb-10">
        {[1, 2, 3, 4, 5, 6, 7].map((i: number) => (
            <CompositionCardLoader key={`node-card-sidepanel-loader-${i}`} />
        ))}
    </div>
);


export const Compositions = () => {
  const { showAddNewComposition, setIsAddingComponent, setIsAddingSubcomponent, setShowAddNewComposition } =
    useManuscriptController(["showAddNewComposition"]);
  const dispatch = useSetter();
  const navigate = useNavigate();
  const { data: compositions, isLoading} = useGetCompositionsQuery()
  console.log('compositions', compositions)
  console.log('isLoading', isLoading)
  const CompositionCollectionView = () => (
    <div className="max-w-2xl w-full self-center flex flex-col gap-6 h-full pb-10">
      {compositions &&
        compositions?.map((composition) => (
          <CompositionCard
            {...composition}
            composition={composition}
            key={`node-card-sidepanel-${composition.uuid}`}
            onClick={() => {
              console.log('clicked')
              //dispatch(setPublicView(false));
              const targetUrl = `${site.app}${app.compositions}/${composition.uuid}`;
              
              setTimeout(() => {
                navigate(targetUrl);
                console.log("navigate", targetUrl);
                setIsAddingComponent(false);
                setIsAddingSubcomponent(false);
                //dispatch(toggleResearchPanel(true));
              });
              //onClose();
            }}
          />
        ))}
    </div>
  );

  const LoadedCompositionsCollection = () =>
    compositions?.length ? <CompositionCollectionView /> : <CompositionCollectionEmptyState />;

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
                <PerfectScrollbar className="overflow-y-scroll w-full justify-center flex h-full px-4 sm:px-0">
                    {isLoading ? <CompositionCollectionLoader /> : <LoadedCompositionsCollection />}
                </PerfectScrollbar>
                <CreateCompositionModal
                    isOpen={showAddNewComposition}
                    onDismiss={() => setShowAddNewComposition(false)}
                />
            </div>
        </div>

    )
}
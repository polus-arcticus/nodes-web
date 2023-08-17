import { api } from ".";
import { endpoints } from "./endpoint";
import { Composition } from "./types";
import { PublishedMap } from "../compositions/types";
import { setPublishedCompositions } from '../compositions/history'
import { setCurrentCompositionId, setCompositionManifest } from "../compositions/compositionReader";
import { tags } from "./tags";
export const compositionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCompositions: builder.query<Composition[], void>({
      providesTags: [{ type: tags.compositions }],
      query: () => `${endpoints.v1.compositions.index}`,
      transformResponse: (response: { compositions: Composition[] }) => {
        return response.compositions;
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        console.log('quering v1.compositions.index')
        try {
          const {data} = await queryFulfilled;
          const publishedCompositions = data
            .filter((n: any) => n.isPublished)
            .map((n: any) => ({ uuid: n.uuid, index: n.index }));

          if (publishedCompositions.length) {
            const map: PublishedMap = {};
            publishedCompositions.forEach((n: any) => {
              map[n.uuid] = n.index;
            });
            dispatch(setPublishedCompositions(map));
          }
        } catch (error) {}
      },
    }),
    getComposition: builder.query<Composition, void>({
      providesTags: [{type: tags.compositions}],
      query: (uuid: string) => `${endpoints.v1.compositions.index}/${uuid}`,
      transformResponse: (response: { composition: Composition}) => {
        return response.composition
      },
      async onQueryStarted(args, {dispatch, queryFulfilled}) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCurrentCompositionId(data.uuid))
          dispatch(setCompositionManifest({
            cid: data.cid,
            createdAt: data.createdAt,
            isPublished: data.isPublished,
            manifestUrl: data.manifestUrl,
            ownerId: data.ownerId,
            title: data.title,
            updatedAt: data.updatedAt,
            uuid: data.uuid,
          }))
        } catch (e) {

        }
      }
    })
})
})
export const {
    useGetCompositionsQuery,
} = compositionsApi
    
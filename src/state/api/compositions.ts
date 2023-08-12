import { api } from ".";
import { endpoints } from "./endpoint";
import { Composition } from "./types";
import { PublishedMap } from "../compositions/types";
import { setPublishedCompositions } from '../compositions/history'
import { tags } from "./tags";
export const compositionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCompositions: builder.query<Composition[], void>({
      providesTags: [{ type: tags.composition }],
      query: () => endpoints.v1.compositions.index,
      transformResponse: (response: { nodes: Composition[] }) => {
        return response.nodes;
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('data', data)
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
    })
})
})
export const {
    useGetCompositionsQuery,
} = compositionsApi
    
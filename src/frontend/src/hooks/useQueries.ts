import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MemeProfile } from "../backend";
import { useActor } from "./useActor";

export function useGetAllMemes() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allMemes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMemes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCommentsForMeme(memeId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["comments", memeId?.toString()],
    queryFn: async () => {
      if (!actor || memeId === null) return [];
      return actor.getCommentsForMeme(memeId);
    },
    enabled: !!actor && !isFetching && memeId !== null,
  });
}

export function useGetMemesByUser(userId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["memesByUser", userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      const all = await actor.getAllMemes();
      return all.filter((m) => m.creatorId.toString() === userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useLikeMeme() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memeId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.likeMeme(memeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allMemes"] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memeId, text }: { memeId: bigint; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(memeId, text);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.memeId.toString()],
      });
    },
  });
}

export function useCreateMemePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      imageBytes,
      caption,
      tags,
    }: { imageBytes: Uint8Array; caption: string; tags: string[] }) => {
      if (!actor) throw new Error("Not connected");
      const { ExternalBlob } = await import("../backend");
      const blob = ExternalBlob.fromBytes(
        imageBytes as Uint8Array<ArrayBuffer>,
      );
      return actor.createMemePost({ imageUrl: blob, caption, tags });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allMemes"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: MemeProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useGenerateMemes() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (prompt: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.generateMemeSuggestions(prompt);
    },
  });
}

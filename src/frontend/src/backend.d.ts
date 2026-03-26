import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type MemeId = bigint;
export type CommentId = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface MemePostDTO {
    tags: Array<string>;
    imageUrl: ExternalBlob;
    caption: string;
}
export interface MemePost {
    id: MemeId;
    createdAt: bigint;
    tags: Array<string>;
    creatorId: Principal;
    imageUrl: ExternalBlob;
    caption: string;
    likesCount: bigint;
}
export interface Comment {
    authorId: Principal;
    text: string;
    authorName: string;
    timestamp: bigint;
    postId: MemeId;
}
export interface http_header {
    value: string;
    name: string;
}
export interface MemeProfile {
    bio: string;
    username: string;
    avatarUrl: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: MemeId, text: string): Promise<CommentId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMemePost(input: MemePostDTO): Promise<MemeId>;
    generateMemeSuggestions(prompt: string): Promise<string>;
    getAllMemes(): Promise<Array<MemePost>>;
    getCallerUserProfile(): Promise<MemeProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentsForMeme(memeId: MemeId): Promise<Array<Comment>>;
    getMemesByUser(user: Principal): Promise<Array<MemePost>>;
    getUserProfile(user: Principal): Promise<MemeProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeMeme(memeId: MemeId): Promise<void>;
    saveCallerUserProfile(profile: MemeProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}

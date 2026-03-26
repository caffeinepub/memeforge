import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import OutCall "http-outcalls/outcall";

actor {
  // INCLUDES
  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // TYPES
  type MemeId = Nat;
  type CommentId = Nat;

  type MemePost = {
    id : MemeId;
    imageUrl : Storage.ExternalBlob;
    caption : Text;
    tags : [Text];
    creatorId : Principal;
    createdAt : Int;
    likesCount : Nat;
  };

  type Comment = {
    postId : MemeId;
    authorId : Principal;
    authorName : Text;
    text : Text;
    timestamp : Int;
  };

  type MemeSuggestion = {
    imageDescription : Text;
    overlayText : Text;
  };

  module MemePost {
    public func compareByCreationTime(a : MemePost, b : MemePost) : Order.Order {
      if (a.createdAt < b.createdAt) { #less } else if (a.createdAt > b.createdAt) {
        #greater;
      } else { #equal };
    };

    public func compareByLikes(a : MemePost, b : MemePost) : Order.Order {
      if (a.likesCount > b.likesCount) { #less } else if (a.likesCount < b.likesCount) {
        #greater;
      } else { #equal };
    };
  };

  public type MemeProfile = {
    username : Text;
    bio : Text;
    avatarUrl : Text;
  };

  // STATE
  let profiles = Map.empty<Principal, MemeProfile>();
  let memes = Map.empty<MemeId, MemePost>();
  let memeComments = Map.empty<CommentId, Comment>();
  let memeLikes = Map.empty<MemeId, List.List<Principal>>();
  var nextMemeId = 0;
  var nextCommentId = 0;

  // PROFILE FUNCTIONS
  public shared ({ caller }) func saveCallerUserProfile(profile : MemeProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?MemeProfile {
    profiles.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?MemeProfile {
    profiles.get(caller);
  };

  // MEME POST FUNCTIONS
  public type MemePostDTO = {
    imageUrl : Storage.ExternalBlob;
    caption : Text;
    tags : [Text];
  };

  public shared ({ caller }) func createMemePost(input : MemePostDTO) : async MemeId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create meme posts");
    };
    let meme : MemePost = {
      id = nextMemeId;
      imageUrl = input.imageUrl;
      caption = input.caption;
      tags = input.tags;
      creatorId = caller;
      createdAt = Time.now();
      likesCount = 0;
    };
    memes.add(nextMemeId, meme);
    nextMemeId += 1;
    meme.id;
  };

  public query ({ caller }) func getAllMemes() : async [MemePost] {
    memes.values().toArray().sort(MemePost.compareByCreationTime);
  };

  public query ({ caller }) func getMemesByUser(user : Principal) : async [MemePost] {
    memes.values().toArray().filter(func(m) { m.creatorId == user });
  };

  public shared ({ caller }) func likeMeme(memeId : MemeId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like memes");
    };
    let likedBy = switch (memeLikes.get(memeId)) {
      case (?likes) { likes };
      case (null) { List.empty<Principal>() };
    };

    if (likedBy.find(func(u) { u == caller }).isNull()) {
      likedBy.add(caller);
      memeLikes.add(memeId, likedBy);
      switch (memes.get(memeId)) {
        case (?meme) {
          let updated = { meme with likesCount = meme.likesCount + 1 };
          memes.add(meme.id, updated);
        };
        case (null) { Runtime.trap("404: Meme not found.") };
      };
    };
  };

  // COMMENT FUNCTIONS
  public shared ({ caller }) func addComment(postId : MemeId, text : Text) : async CommentId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };
    let authorName = switch (profiles.get(caller)) {
      case (?profile) { profile.username };
      case (null) { "Anonymous" };
    };

    let newComment : Comment = {
      postId;
      authorId = caller;
      authorName;
      text;
      timestamp = Time.now();
    };
    memeComments.add(nextCommentId, newComment);
    nextCommentId += 1;
    nextCommentId - 1;
  };

  public query ({ caller }) func getCommentsForMeme(memeId : MemeId) : async [Comment] {
    memeComments.values().toArray().filter(func(c) { c.postId == memeId });
  };

  // AI MEME SUGGESTIONS
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func generateMemeSuggestions(prompt : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate meme suggestions");
    };
    await OutCall.httpGetRequest("https://api.meme-generator.com/suggestions?prompt=" # prompt, [], transform);
  };
};

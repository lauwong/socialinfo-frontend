import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Context, Follow, Post, UpvoteContext, UpvotePost, User, WebSession } from "./app";
import { NotAllowedError, NotFoundError } from "./concepts/errors";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

import { summarize } from "./helpers";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts/all")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.get("/posts/following")
  async getUserFeed(session: WebSessionDoc, author?: string) {
    const u = WebSession.getUser(session);
    const following = await Follow.getFollows(u);

    const filt = following.map((f) => f.other).filter((name) => (author ? name.toString() === author : true));

    const feed = await Post.getPosts({
      author: {
        $in: filt,
      },
    });
    return await Responses.posts(feed);
  }

  @Router.get("/posts/:_id")
  async getPost(_id: ObjectId) {
    const post = await Post.getById(_id);
    return Responses.post(post);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);

    if (created.post) {
      const summary = await summarize(created.post.content);
      await Context.create(created.post._id, summary);
    }

    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/follows/following")
  async getFollows(session: WebSessionDoc) {
    // Gets the users that the session user is following
    const user = WebSession.getUser(session);
    return await Responses.following(await Follow.getFollows(user));
  }

  @Router.get("/follows/followers")
  async getFollowers(session: WebSessionDoc) {
    // Gets the users that follow the session user
    const user = WebSession.getUser(session);
    return await Responses.followers(await Follow.getFollowers(user));
  }

  @Router.get("/follows/following/:user")
  async isFollowing(session: WebSessionDoc, user: string) {
    // Gets the users that the session user is following
    const u = WebSession.getUser(session);
    const other = (await User.getUserByUsername(user))._id;
    return await Follow.isFollowing(u, other);
  }

  @Router.post("/follows/:user")
  async follow(session: WebSessionDoc, user: string) {
    const u = WebSession.getUser(session);
    const other = (await User.getUserByUsername(user))._id;
    return await Follow.follow(u, other);
  }

  @Router.delete("/follows/:user")
  async unfollow(session: WebSessionDoc, user: string) {
    const u = WebSession.getUser(session);
    const other = (await User.getUserByUsername(user))._id;
    return await Follow.unfollow(u, other);
  }

  @Router.get("/contexts")
  async getContextsByParent(parent: ObjectId) {
    await Post.isPost(parent);
    const contexts = await Context.getByParent(new ObjectId(parent));
    return Responses.contexts(contexts);
  }

  @Router.post("/contexts")
  async createContext(session: WebSessionDoc, parent: ObjectId, content: string) {
    const user = WebSession.getUser(session);
    const parentPost = await Post.getById(parent);

    if (!parentPost) {
      throw new NotFoundError("Parent post not found!");
    }
    if (parentPost.author.toString() === user.toString()) {
      throw new NotAllowedError("User may not add context to their own post!");
    }

    const created = await Context.create(new ObjectId(parent), content, user);
    return { msg: created.msg, context: await Responses.context(created.context) };
  }

  @Router.delete("/contexts/:_id")
  async deleteContext(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Context.isAuthor(user, _id);
    return await Context.delete(_id);
  }

  @Router.post("/upvotes/:_id")
  async castUpvote(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    try {
      await Post.isPost(_id);
      return await UpvotePost.cast(user, id);
    } catch (e) {
      return await UpvoteContext.cast(user, id);
    }
  }

  @Router.delete("/upvotes/:_id")
  async retractUpvote(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    try {
      await Post.isPost(_id);
      return await UpvotePost.retract(user, id);
    } catch (e) {
      return await UpvoteContext.retract(user, id);
    }
  }

  @Router.get("/upvotes/:_id")
  async userHasUpvoted(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    const id = new ObjectId(_id);
    const votedForPost = await UpvotePost.hasVoted(user, id);
    if (votedForPost.voted) {
      return votedForPost;
    }

    const votedForContext = await UpvoteContext.hasVoted(user, id);
    if (votedForContext.voted) {
      return votedForContext;
    }

    return { msg: "Checked if user voted for item!", voted: false };
  }

  @Router.get("/upvotes/count/:_id")
  async countUpvotes(_id: ObjectId) {
    const matchingPosts = await Post.getPosts({ _id });
    const id = new ObjectId(_id);
    if (matchingPosts.length > 0) {
      return await UpvotePost.countVotes(id);
    }

    const matchingContexts = await Context.getContexts({ _id });
    if (matchingContexts.length > 0) {
      return await UpvoteContext.countVotes(id);
    }

    throw new NotFoundError(`Item with id ${_id} was not found!`);
  }

  @Router.get("/upvotes/posts/:_id")
  async getTopContext(_id: ObjectId) {
    await Post.isPost(_id);

    const contexts = await Context.getByParent(new ObjectId(_id));

    if (contexts.length === 0) {
      return { msg: `Post ${_id} has no contexts!` };
    }

    const top_id = await UpvoteContext.getMostUpvoted(contexts.map((ctx) => ctx._id));
    const top_context = await Context.getById(top_id);

    return { msg: "Most upvoted item retrieved!", item: await Responses.context(top_context) };
  }
}

export default getExpressRouter(new Routes());

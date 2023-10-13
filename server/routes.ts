import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Context, Follow, Post, UpvoteContext, UpvotePost, User, WebSession } from "./app";
import { NotFoundError } from "./concepts/errors";
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
    await Post.isPost(parent);
    const created = await Context.create(new ObjectId(parent), content, user);
    return { msg: created.msg, context: await Responses.context(created.context) };
  }

  @Router.post("/upvotes/posts/:_id")
  async castPostUpvote(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isPost(_id);
    return await UpvotePost.cast(user, _id);
  }

  @Router.delete("/upvotes/posts/:_id")
  async retractPostUpvote(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isPost(_id);
    return await UpvotePost.retract(user, _id);
  }

  @Router.post("/upvotes/contexts/:_id")
  async castContextUpvote(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Context.isContext(_id);
    return await UpvoteContext.cast(user, _id);
  }

  @Router.delete("/upvotes/contexts/:_id")
  async retractContextUpvote(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Context.isContext(_id);
    return await UpvoteContext.retract(user, _id);
  }

  @Router.get("/upvotes/:_id")
  async countUpvotes(_id: ObjectId) {
    const matchingPosts = await Post.getPosts({ _id });
    if (matchingPosts.length > 0) {
      return await UpvotePost.countVotes(_id);
    }

    const matchingContexts = await Context.getContexts({ _id });
    if (matchingContexts.length > 0) {
      return await UpvoteContext.countVotes(_id);
    }

    return new NotFoundError(`Item with id ${_id} was not found!`);
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

import axios from "axios";
import { map } from "lodash";
import {
	FETCH_USERS,
	USER_LOGIN,
	USER_LOGOUT,
	ADD_POST,
	DELETE_LIKE,
	ADD_COMMENT,
	CREATE_USER,
	TOGGLE_FOLLOW,
	USER_ADD_POST,
	ADD_LIKE,
	FOLLOW_USER,
	UNFOLLOW_USER,
	ADD_EXPLORE_POST,
	ADD_FOLLOWER,
	UNADD_FOLLOWER,
	ADD_HOME_POSTS,
	USER_ADD_HOME_POST
} from "./types";

export const getAllUsers = () => async (dispatch) => {
	const res = await axios.get("/auth/users");
	dispatch({ type: FETCH_USERS, payload: res.data });
};

export const createUser = (newUserData) => async (dispatch) => {
	const res = await axios.post("/auth/register", newUserData); //creates the user in the DB
	console.log(res);
	console.log("User Created");

	//after your route is finished should return data like this below
	const userAuth = {
		userUid: res.data.insertId //will be generated by backend
	};
	const newUser = {
		userData: {
			username: res.data.username,
			email: res.data.email,
			userUid: res.data.insertId,
			fullName: res.data.fullName,
			followers: [],
			following: [],
			posts: []
		},
		userUid: res.data.insertId
	};

	console.log(newUser);
	dispatch({ type: CREATE_USER, payload: newUser }); //this will be when the user is created and added to redux store

	dispatch({ type: USER_LOGIN, payload: userAuth }); //use USER LOGIN reducer to trigger app login (payload will be res.data)
};

export const logOut = () => async (dispatch) => {
	// const res = await axios.post   # Your DB Call here <---
	console.log("Log Out");

	const emptyState = {
		userUid: null
	};

	dispatch({ type: USER_LOGOUT, payload: emptyState });
};

export const signInUser = (username, password) => async (dispatch) => {
	const res = await axios.post("/auth/login", { username, password });
	console.log("Sign IN");
	console.log(username, " ", password);
	console.log("response in signInUser", res.data);
	if (!res) {
		alert("No Match!");
	}
	const userAuth = {
		userUid: res.data.user_id //will be generated by backend
	};

	let userPosts = [];
	const postsMap = res.data.userPostResult.map((post) => userPosts.push(post.postUid));

	const userState = {
		userData: {
			username: res.data.username,
			email: res.data.email,
			userUid: res.data.user_id,
			fullName: res.data.fullName,
			followers: res.data.userFollowers,
			following: res.data.userFollowing,
			posts: userPosts
		},
		userUid: res.data.user_id
	};
	dispatch({ type: CREATE_USER, payload: userState }); //this will be when the user is created and added to redux store\\

	res.data.userData.map((user) => {
		dispatch({ type: CREATE_USER, payload: user });
	});

	dispatch({ type: USER_LOGIN, payload: userAuth });
	res.data.postDataArray.map((postData) => {
		dispatch({ type: ADD_POST, payload: postData });
	});
	res.data.explorePostArray.map((postData) => {
		dispatch({ type: ADD_EXPLORE_POST, payload: postData });
	});
	res.data.homePostArray.map((postData) => {
		dispatch({ type: ADD_HOME_POSTS, payload: postData });
	});
};

export const userAddPost = (thisPostData) => async (dispatch) => {
	const res = await axios.post("/api/posts/create", thisPostData);

	const postData = {
		postData: {
			title: res.data.title,
			postUid: res.data.insertId,
			description: res.data.description,
			file: res.data.file,
			thumbnail: res.data.thumbnail,
			authorUid: res.data.authorUid,
			timestamp: res.data.timestamp,
			numLikes: res.data.numLikes,
			numComments: res.data.numComments,
			usersLiked: res.data.usersLiked,
			comments: res.data.comments
		},
		postUid: res.data.insertId
	};

	const userPost = {
		postUid: res.data.insertId,
		userUid: res.data.authorUid
	};

	const homePost = {
		postUid: res.data.insertId,
	};

	dispatch({ type: ADD_POST, payload: postData });
	dispatch({ type: USER_ADD_POST, payload: userPost });
	dispatch({ type: ADD_HOME_POSTS, payload: homePost });

};

// get all posts done by one user

export const deleteLike = (userLiked, postUid) => async (dispatch) => {
	const likeData = {
		user_id: userLiked,
		postUid: postUid
	};
	const res = await axios.post("/api/posts/deletelike", likeData);
	console.log("delete like");
	const deletedLikeObject = {
		userLiked: res.data.user_id,
		postUid: res.data.postUid
	};
	dispatch({ type: DELETE_LIKE, payload: deletedLikeObject });
};

export const addLike = (userLiked, postUid) => async (dispatch) => {
	const likeData = {
		user_id: userLiked,
		postUid: postUid
	};
	const res = await axios.post("/api/posts/addlike", likeData);
	const likeObject = {
		userLiked: res.data.user_id,
		postUid: res.data.postUid
	};
	console.log("likeObject", likeObject);

	dispatch({ type: ADD_LIKE, payload: likeObject });
};

export const userAddComment = (thisPostUid, newCommentData) => async (dispatch) => {
	const commentData = {
		user_id: newCommentData.commentAuthorUid,
		content: newCommentData.commentContents,
		postUid: thisPostUid
	};
	const res = await axios.post("/api/posts/addcomment", commentData);

	const payload = {
		commentData: {
			commentAuthorUid: res.data.user_id,
			commentContents: res.data.content
		},
		postUid: res.data.postUid
	};

	dispatch({ type: ADD_COMMENT, payload: payload });
};

export const followUser = (currentUser, userFollowed) => async (dispatch) => {
	const followData = {
		follower_id: currentUser,
		followee_id: userFollowed
	};
	const res = await axios.post("/api/posts/followuser", followData);

	const userPayload = {
		userUid: res.data.follower_id,
		followedUser: res.data.followee_id
	};

	const followedUserPayload = {
		userUid: res.data.followee_id,
		newFollower: res.data.follower_id
	};

	dispatch({ type: FOLLOW_USER, payload: userPayload });
	dispatch({ type: ADD_FOLLOWER, payload: followedUserPayload });
};

export const unfollowUser = (currentUser, userFollowed) => async (dispatch) => {
	const followData = {
		follower_id: currentUser,
		followee_id: userFollowed
	};
	const res = await axios.post("/api/posts/unfollowuser", followData);

	const userPayload = {
		userUid: res.data.follower_id,
		followedUser: res.data.followee_id
	};

	const unfollowedUserPayload = {
		userUid: res.data.followee_id,
		unFollower: res.data.follower_id
	};

	dispatch({ type: UNFOLLOW_USER, payload: userPayload });
	dispatch({ type: UNADD_FOLLOWER, payload: unfollowedUserPayload });
};

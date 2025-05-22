// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 监听合约
contract SocialMediaListener {
    address public owner;
    
    // 被监听的合约地址
    address public tweetsContractAddress;
    address public followContractAddress;
    address public bookmarkContractAddress;
    
    // 事件记录
    struct TweetEvent {
        address tweeter;
        uint256 tweetId;
        string tweetText;
        string tweetImg;
        uint256 timestamp;
    }
    
    struct LikeEvent {
        address liker;
        uint256 tweetId;
        bool isLiked;
        uint256 timestamp;
    }
    
    struct CommentEvent {
        address commenter;
        uint256 tweetId;
        string commentText;
        uint256 timestamp;
    }
    
    struct FollowEvent {
        address follower;
        address following;
        bool isFollowing; // true=follow, false=unfollow
        uint256 timestamp;
    }
    
    struct BookmarkEvent {
        address bookmarker;
        uint256 tweetId;
        uint256 bookmarkId;
        bool isBookmarked; // true=bookmark, false=remove
        uint256 timestamp;
    }
    
    // 存储所有事件
    TweetEvent[] public tweetEvents;
    LikeEvent[] public likeEvents;
    CommentEvent[] public commentEvents;
    FollowEvent[] public followEvents;
    BookmarkEvent[] public bookmarkEvents;
    
    // 构造函数，设置被监听合约地址
    constructor(
        address _tweetsContract,
        address _followContract,
        address _bookmarkContract
    ) {
        owner = msg.sender;
        tweetsContractAddress = _tweetsContract;
        followContractAddress = _followContract;
        bookmarkContractAddress = _bookmarkContract;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // 更新被监听合约地址
    function updateContractsAddress(
        address _tweetsContract,
        address _followContract,
        address _bookmarkContract
    ) external onlyOwner {
        tweetsContractAddress = _tweetsContract;
        followContractAddress = _followContract;
        bookmarkContractAddress = _bookmarkContract;
    }
    
    // ========== 监听Tweets合约事件 ==========
    
    function onTweetCreated(
        address tweeter,
        uint256 id,
        string memory tweetTxt,
        string memory tweetImg
    ) external {
        require(msg.sender == tweetsContractAddress, "Caller is not Tweets contract");
        
        tweetEvents.push(TweetEvent({
            tweeter: tweeter,
            tweetId: id,
            tweetText: tweetTxt,
            tweetImg: tweetImg,
            timestamp: block.timestamp
        }));
    }
    
    function onTweetLiked(
        address liker,
        uint256 tweetId,
        bool isLiked
    ) external {
        require(msg.sender == tweetsContractAddress, "Caller is not Tweets contract");
        
        likeEvents.push(LikeEvent({
            liker: liker,
            tweetId: tweetId,
            isLiked: isLiked,
            timestamp: block.timestamp
        }));
    }
    
    function onCommentAdded(
        address commenter,
        uint256 tweetId,
        string memory commentText
    ) external {
        require(msg.sender == tweetsContractAddress, "Caller is not Tweets contract");
        
        commentEvents.push(CommentEvent({
            commenter: commenter,
            tweetId: tweetId,
            commentText: commentText,
            timestamp: block.timestamp
        }));
    }
    
    // ========== 监听Follow合约事件 ==========
    
    function onFollowed(
        address follower,
        address following
    ) external {
        require(msg.sender == followContractAddress, "Caller is not Follow contract");
        
        followEvents.push(FollowEvent({
            follower: follower,
            following: following,
            isFollowing: true,
            timestamp: block.timestamp
        }));
    }
    
    function onUnfollowed(
        address follower,
        address unfollowing
    ) external {
        require(msg.sender == followContractAddress, "Caller is not Follow contract");
        
        followEvents.push(FollowEvent({
            follower: follower,
            following: unfollowing,
            isFollowing: false,
            timestamp: block.timestamp
        }));
    }
    
    // ========== 监听Bookmark合约事件 ==========
    
    function onTweetBookmarked(
        address bookmarker,
        uint256 tweetId,
        uint256 bookmarkId
    ) external {
        require(msg.sender == bookmarkContractAddress, "Caller is not Bookmark contract");
        
        bookmarkEvents.push(BookmarkEvent({
            bookmarker: bookmarker,
            tweetId: tweetId,
            bookmarkId: bookmarkId,
            isBookmarked: true,
            timestamp: block.timestamp
        }));
    }
    
    function onBookmarkRemoved(
        address bookmarker,
        uint256 tweetId,
        uint256 bookmarkId
    ) external {
        require(msg.sender == bookmarkContractAddress, "Caller is not Bookmark contract");
        
        bookmarkEvents.push(BookmarkEvent({
            bookmarker: bookmarker,
            tweetId: tweetId,
            bookmarkId: bookmarkId,
            isBookmarked: false,
            timestamp: block.timestamp
        }));
    }
    
    // ========== 查询函数 ==========
    
    function getAllTweetEvents() external view returns (TweetEvent[] memory) {
        return tweetEvents;
    }
    
    function getAllLikeEvents() external view returns (LikeEvent[] memory) {
        return likeEvents;
    }
    
    function getAllCommentEvents() external view returns (CommentEvent[] memory) {
        return commentEvents;
    }
    
    function getAllFollowEvents() external view returns (FollowEvent[] memory) {
        return followEvents;
    }
    
    function getAllBookmarkEvents() external view returns (BookmarkEvent[] memory) {
        return bookmarkEvents;
    }
    
    function getTweetEventsCount() external view returns (uint256) {
        return tweetEvents.length;
    }
    
    function getLikeEventsCount() external view returns (uint256) {
        return likeEvents.length;
    }
    
    function getCommentEventsCount() external view returns (uint256) {
        return commentEvents.length;
    }
    
    function getFollowEventsCount() external view returns (uint256) {
        return followEvents.length;
    }
    
    function getBookmarkEventsCount() external view returns (uint256) {
        return bookmarkEvents.length;
    }
}

// 需要被监听合约实现的接口
interface ITweets {
    event TweetCreated(address indexed tweeter, uint256 id, string tweetTxt, string tweetImg);
    event TweetLiked(address indexed liker, uint256 tweetId, bool isLiked);
    event CommentAdded(address indexed commenter, uint256 tweetId, string commentText);
}

interface IFollow {
    event Followed(address indexed follower, address indexed following);
    event Unfollowed(address indexed follower, address indexed unfollowing);
}

interface IBookmark {
    event TweetBookmarked(address indexed bookmarker, uint256 indexed tweetId, uint256 bookmarkId);
    event BookmarkRemoved(address indexed bookmarker, uint256 indexed tweetId, uint256 bookmarkId);
}
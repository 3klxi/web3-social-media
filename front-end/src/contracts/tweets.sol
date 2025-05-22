// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Tweets {
    address public owner;
    uint256 private counter;

    constructor() {
        counter = 0;
        owner = msg.sender;
    }

    struct Tweet {
        address tweeter;
        uint256 id;
        string tweetTxt;
        string tweetImg;
        uint256 likeCount;
        address[] likers;
    }

    struct Comment {
        address commenter;
        string commentText;
        uint256 tweetid;
    }

    event TweetCreated(
        address indexed tweeter,
        uint256 id,
        string tweetTxt,
        string tweetImg
    );

    event TweetLiked(
        address indexed liker,
        uint256 tweetId,
        bool isLiked
    );

    event CommentAdded(
        address indexed commenter,
        uint256 tweetId,
        string commentText
    );

    mapping(uint256 => Tweet) public tweets;
    mapping(uint256 => mapping(address => bool)) public hasLiked;
    mapping(uint256 => Comment[]) public comments;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function addTweet(
        string memory tweetTxt,
        string memory tweetImg
    ) public payable {
        require(msg.value == 0.01 ether, "Please submit 0.01 MATIC");
        require(bytes(tweetTxt).length <= 280, "Tweet text exceeds 280 characters");
        
        Tweet storage newTweet = tweets[counter];
        newTweet.tweeter = msg.sender;
        newTweet.id = counter;
        newTweet.tweetTxt = tweetTxt;
        newTweet.tweetImg = tweetImg;
        newTweet.likeCount = 0;

        emit TweetCreated(msg.sender, counter, tweetTxt, tweetImg);
        counter++;

        payable(owner).transfer(msg.value);
    }

    function getTweet(
        uint256 id
    ) public view returns (address, uint256, string memory, string memory, uint256) {
        require(id < counter, "No such Tweet");
        Tweet storage t = tweets[id];
        return (t.tweeter, t.id, t.tweetTxt, t.tweetImg, t.likeCount);
    }



function likeTweet(uint256 tweetId) public {
    require(tweetId < counter, "No such Tweet");
    
    if (hasLiked[tweetId][msg.sender]) {
        // 取消点赞
        hasLiked[tweetId][msg.sender] = false;
        tweets[tweetId].likeCount--;
        
        // 从点赞者列表中移除
        for (uint i = 0; i < tweets[tweetId].likers.length; i++) {
            if (tweets[tweetId].likers[i] == msg.sender) {
                // 将最后一个元素移到当前位置，然后删除最后一个元素
                tweets[tweetId].likers[i] = tweets[tweetId].likers[tweets[tweetId].likers.length - 1];
                tweets[tweetId].likers.pop();
                break;
            }
        }
        
        emit TweetLiked(msg.sender, tweetId, false);
    } else {
        // 点赞
        hasLiked[tweetId][msg.sender] = true;
        tweets[tweetId].likeCount++;
        
        // 添加到点赞者列表
        tweets[tweetId].likers.push(msg.sender);
        
        emit TweetLiked(msg.sender, tweetId, true);
    }
}

    function checkIfLiked(uint256 tweetId, address user) public view returns (bool) {
        require(tweetId < counter, "No such Tweet");
        return hasLiked[tweetId][user];
    }

    function getLikeCount(uint256 tweetId) public view returns (uint256) {
        require(tweetId < counter, "No such Tweet");
        return tweets[tweetId].likeCount;
    }


function addComment(uint256 tweetId, string memory commentText) public {
    require(tweetId < counter, unicode"推文不存在"); // ✅ 使用 unicode 字符串
    require(bytes(commentText).length > 0, unicode"评论不能为空");
    
    comments[tweetId].push(Comment({
        commenter: msg.sender,
        commentText: commentText,
        tweetid: tweetId
    }));
    
    emit CommentAdded(msg.sender, tweetId, commentText);
}


    function getComments(uint256 tweetId) public view returns (Comment[] memory) {
        require(tweetId < counter, "No such Tweet");
        return comments[tweetId];
    }

    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    function getCounter() public view returns (uint256) {
        return counter - 1;
    }
}
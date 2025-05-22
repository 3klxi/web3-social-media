// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {SocialMediaListener} from "./listener.sol";

contract TweetBookmarks {
    address public owner;
    uint256 public bookmarkCounter;
    address public listenerContract;

    // 添加设置监听合约的方法
    function setListenerContract(address _listenerContract) external onlyOwner {
        require(listenerContract == address(0), "Listener already set");
        listenerContract = _listenerContract;
    }

    // Original tweets contract interface
    ITweets public tweetsContract;

    constructor(address _tweetsContractAddress) {
        owner = msg.sender;
        tweetsContract = ITweets(_tweetsContractAddress);
    }

    struct Bookmark {
        address bookmarker;
        uint256 tweetId;
        uint256 timestamp;
    }

    event TweetBookmarked(
        address indexed bookmarker,
        uint256 indexed tweetId,
        uint256 bookmarkId
    );

    event BookmarkRemoved(
        address indexed bookmarker,
        uint256 indexed tweetId,
        uint256 bookmarkId
    );

    // Mapping from user to their bookmarked tweet IDs
    mapping(address => uint256[]) private userBookmarks;

    // Mapping from bookmark ID to Bookmark struct
    mapping(uint256 => Bookmark) public bookmarks;

    // Mapping from tweet ID to array of bookmark IDs
    mapping(uint256 => uint256[]) public tweetBookmarks;

    // Mapping from user to tweet ID to bookmark ID (for quick lookup)
    mapping(address => mapping(uint256 => uint256)) private userTweetBookmark;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function bookmarkTweet(uint256 tweetId) external payable {
        require(
            msg.value == 0.0101 ether,
            "Please submit 0.0101 MATIC (0.01 to author + 0.0001 fee)"
        );

        // Check if tweet exists by trying to get its info
        (address tweeter, , , , ) = tweetsContract.getTweet(tweetId);
        require(tweeter != address(0), "Tweet does not exist");

        // Check if already bookmarked
        require(
            userTweetBookmark[msg.sender][tweetId] == 0,
            "Tweet already bookmarked"
        );

        // Create new bookmark
        bookmarkCounter++;
        Bookmark storage newBookmark = bookmarks[bookmarkCounter];
        newBookmark.bookmarker = msg.sender;
        newBookmark.tweetId = tweetId;
        newBookmark.timestamp = block.timestamp;

        // Update mappings
        userBookmarks[msg.sender].push(bookmarkCounter);
        tweetBookmarks[tweetId].push(bookmarkCounter);
        userTweetBookmark[msg.sender][tweetId] = bookmarkCounter;

        // Distribute payments
        payable(tweeter).transfer(0.01 ether);
        payable(owner).transfer(0.0001 ether);

        emit TweetBookmarked(msg.sender, tweetId, bookmarkCounter);
        if (listenerContract != address(0)) {
            SocialMediaListener(listenerContract).onTweetBookmarked(
                msg.sender,
                tweetId,
                bookmarkCounter
            );
        }
    }

    function removeBookmark(uint256 tweetId) external {
        uint256 bookmarkId = userTweetBookmark[msg.sender][tweetId];
        require(bookmarkId != 0, "No bookmark found for this tweet");

        // Remove from user's bookmarks
        uint256[] storage userBms = userBookmarks[msg.sender];
        for (uint256 i = 0; i < userBms.length; i++) {
            if (userBms[i] == bookmarkId) {
                userBms[i] = userBms[userBms.length - 1];
                userBms.pop();
                break;
            }
        }

        // Remove from tweet's bookmarks
        uint256[] storage tweetBms = tweetBookmarks[tweetId];
        for (uint256 i = 0; i < tweetBms.length; i++) {
            if (tweetBms[i] == bookmarkId) {
                tweetBms[i] = tweetBms[tweetBms.length - 1];
                tweetBms.pop();
                break;
            }
        }

        // Clear the quick lookup
        delete userTweetBookmark[msg.sender][tweetId];

        // Delete the bookmark itself
        delete bookmarks[bookmarkId];

        emit BookmarkRemoved(msg.sender, tweetId, bookmarkId);
        if (listenerContract != address(0)) {
            SocialMediaListener(listenerContract).onBookmarkRemoved(
                msg.sender,
                tweetId,
                bookmarkId
            );
        }
    }

    function getUserBookmarks(
        address user
    ) external view returns (uint256[] memory) {
        return userBookmarks[user];
    }

    function getBookmarkDetails(
        uint256 bookmarkId
    ) external view returns (Bookmark memory) {
        return bookmarks[bookmarkId];
    }

    function getTweetBookmarks(
        uint256 tweetId
    ) external view returns (uint256[] memory) {
        return tweetBookmarks[tweetId];
    }

    function isBookmarked(
        address user,
        uint256 tweetId
    ) external view returns (bool) {
        return userTweetBookmark[user][tweetId] != 0;
    }

    function withdrawFunds() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}

// Interface for the original Tweets contract
interface ITweets {
    function getTweet(
        uint256 id
    )
        external
        view
        returns (address, uint256, string memory, string memory, uint256);
}

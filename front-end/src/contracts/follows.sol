// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Follow {
    // 用户地址 => 该用户关注的人的地址集合
    mapping(address => address[]) private _following;
    
    // 用户地址 => 关注该用户的人的地址集合
    mapping(address => address[]) private _followers;
    
    // 用户地址 => 被关注人地址 => 是否已关注
    mapping(address => mapping(address => bool)) private _isFollowing;
    
    // 关注事件
    event Followed(address indexed follower, address indexed following);
    
    // 取消关注事件
    event Unfollowed(address indexed follower, address indexed unfollowing);
    
    /**
     * @dev 关注某个用户
     * @param following 要关注的用户地址
     */
    function follow(address following) external {
        require(following != address(0), "Invalid address");
        require(following != msg.sender, "Cannot follow yourself");
        require(!_isFollowing[msg.sender][following], "Already following");
        
        _following[msg.sender].push(following);
        _followers[following].push(msg.sender);
        _isFollowing[msg.sender][following] = true;
        
        emit Followed(msg.sender, following);
    }
    
    /**
     * @dev 取消关注某个用户
     * @param following 要取消关注的用户地址
     */
    function unfollow(address following) external {
        require(following != address(0), "Invalid address");
        require(_isFollowing[msg.sender][following], "Not following");
        
        // 从关注列表中移除
        _removeFromList(_following[msg.sender], following);
        
        // 从对方的粉丝列表中移除
        _removeFromList(_followers[following], msg.sender);
        
        _isFollowing[msg.sender][following] = false;
        
        emit Unfollowed(msg.sender, following);
    }
    
    /**
     * @dev 内部函数：从数组中移除特定元素
     * @param list 要操作的数组
     * @param element 要移除的元素
     */
    function _removeFromList(address[] storage list, address element) private {
        uint256 length = list.length;
        for (uint256 i = 0; i < length; i++) {
            if (list[i] == element) {
                // 将最后一个元素移到当前位置
                if (i != length - 1) {
                    list[i] = list[length - 1];
                }
                // 移除最后一个元素
                list.pop();
                break;
            }
        }
    }
    
    /**
     * @dev 获取我关注的人的列表
     * @param user 用户地址
     * @return 关注列表
     */
    function getFollowing(address user) external view returns (address[] memory) {
        return _following[user];
    }
    
    /**
     * @dev 获取关注我的人的列表
     * @param user 用户地址
     * @return 粉丝列表
     */
    function getFollowers(address user) external view returns (address[] memory) {
        return _followers[user];
    }
    
    /**
     * @dev 检查是否关注了某个用户
     * @param follower 关注者地址
     * @param following 被关注者地址
     * @return 是否已关注
     */
    function isFollowing(address follower, address following) external view returns (bool) {
        return _isFollowing[follower][following];
    }
    
    /**
     * @dev 获取我关注的人数
     * @param user 用户地址
     * @return 关注人数
     */
    function followingCount(address user) external view returns (uint256) {
        return _following[user].length;
    }
    
    /**
     * @dev 获取我的粉丝数
     * @param user 用户地址
     * @return 粉丝数
     */
    function followersCount(address user) external view returns (uint256) {
        return _followers[user].length;
    }
}
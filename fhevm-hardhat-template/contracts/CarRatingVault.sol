// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, euint32, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title CarRatingVault - 隐私汽车评分合约
/// @notice 用户可以对汽车进行加密评分，仅创建者可解密查看统计结果
contract CarRatingVault is SepoliaConfig {
    /// @notice 评分项目结构
    struct Rating {
        uint256 id;
        address creator;
        string carModel;
        uint16 carYear;
        string description;
        string[] dimensions;
        uint256 endTime;
        uint256 participantCount;
        bool exists;
        bool resultsDecrypted;
    }

    /// @notice 评分计数器
    uint256 public ratingCounter;

    /// @notice 评分项目映射
    mapping(uint256 => Rating) public ratings;

    /// @notice 每个评分项目的每个维度的加密总分
    /// ratingId => dimensionIndex => encryptedSum
    mapping(uint256 => mapping(uint256 => euint32)) public encryptedDimensionSums;

    /// @notice 每个评分项目的加密参与计数
    mapping(uint256 => euint32) public encryptedParticipantCounts;

    /// @notice 用户是否已参与某个评分
    /// ratingId => user => hasParticipated
    mapping(uint256 => mapping(address => bool)) public hasParticipated;

    /// @notice 用户创建的评分列表
    mapping(address => uint256[]) public userCreations;

    /// @notice 用户参与的评分列表
    mapping(address => uint256[]) public userParticipations;

    /// @notice 评分创建事件
    event RatingCreated(
        uint256 indexed ratingId,
        address indexed creator,
        string carModel,
        uint16 carYear,
        uint256 endTime
    );

    /// @notice 评分提交事件
    event RatingSubmitted(
        uint256 indexed ratingId,
        address indexed participant,
        uint256 timestamp
    );

    /// @notice 结果解密事件
    event ResultsDecrypted(
        uint256 indexed ratingId,
        address indexed creator,
        uint256 timestamp
    );

    /// @notice 评分提前结束事件
    event RatingEndedEarly(
        uint256 indexed ratingId,
        address indexed creator,
        uint256 originalEndTime,
        uint256 newEndTime
    );

    /// @notice 错误：评分不存在
    error RatingNotExists();

    /// @notice 错误：评分已结束
    error RatingEnded();

    /// @notice 错误：评分未结束
    error RatingNotEnded();

    /// @notice 错误：已经参与过
    error AlreadyParticipated();

    /// @notice 错误：维度数量不匹配
    error DimensionMismatch();

    /// @notice 错误：仅创建者可调用
    error OnlyCreator();

    /// @notice 错误：无效的结束时间
    error InvalidEndTime();

    /// @notice 错误：维度数量不能为空
    error EmptyDimensions();

    /// @notice 创建评分项目
    /// @param carModel 汽车型号
    /// @param carYear 生产年份
    /// @param description 描述信息
    /// @param dimensions 评分维度列表
    /// @param endTime 评分截止时间（Unix 时间戳）
    /// @return ratingId 新创建的评分ID
    function createRating(
        string memory carModel,
        uint16 carYear,
        string memory description,
        string[] memory dimensions,
        uint256 endTime
    ) public returns (uint256 ratingId) {
        if (endTime <= block.timestamp) revert InvalidEndTime();
        if (dimensions.length == 0) revert EmptyDimensions();

        ratingId = ++ratingCounter;

        Rating storage rating = ratings[ratingId];
        rating.id = ratingId;
        rating.creator = msg.sender;
        rating.carModel = carModel;
        rating.carYear = carYear;
        rating.description = description;
        rating.dimensions = dimensions;
        rating.endTime = endTime;
        rating.participantCount = 0;
        rating.exists = true;

        // 初始化加密参与计数为 0
        encryptedParticipantCounts[ratingId] = FHE.asEuint32(0);
        FHE.allowThis(encryptedParticipantCounts[ratingId]);

        // 初始化每个维度的加密总分为 0
        for (uint256 i = 0; i < dimensions.length; i++) {
            encryptedDimensionSums[ratingId][i] = FHE.asEuint32(0);
            FHE.allowThis(encryptedDimensionSums[ratingId][i]);
        }

        userCreations[msg.sender].push(ratingId);

        emit RatingCreated(ratingId, msg.sender, carModel, carYear, endTime);
    }

    /// @notice 提交评分
    /// @param ratingId 评分项目ID
    /// @param encryptedScores 加密的评分句柄数组（每个维度1-10分）
    /// @param inputProof 加密输入的证明
    function submitRating(
        uint256 ratingId,
        externalEuint8[] calldata encryptedScores,
        bytes calldata inputProof
    ) public {
        Rating storage rating = ratings[ratingId];
        
        if (!rating.exists) revert RatingNotExists();
        if (block.timestamp > rating.endTime) revert RatingEnded();
        if (hasParticipated[ratingId][msg.sender]) revert AlreadyParticipated();
        if (encryptedScores.length != rating.dimensions.length) revert DimensionMismatch();

        // 将每个维度的加密评分累加到总分
        for (uint256 i = 0; i < encryptedScores.length; i++) {
            // 从外部加密输入转换为 euint8
            euint8 score = FHE.fromExternal(encryptedScores[i], inputProof);
            
            // 转换为 euint32 并累加
            euint32 score32 = FHE.asEuint32(score);
            encryptedDimensionSums[ratingId][i] = FHE.add(
                encryptedDimensionSums[ratingId][i],
                score32
            );
            // 重新授权给合约自己
            FHE.allowThis(encryptedDimensionSums[ratingId][i]);
        }

        // 加密参与计数 +1
        euint32 one = FHE.asEuint32(1);
        encryptedParticipantCounts[ratingId] = FHE.add(
            encryptedParticipantCounts[ratingId],
            one
        );
        // 重新授权给合约自己
        FHE.allowThis(encryptedParticipantCounts[ratingId]);

        // 标记用户已参与
        hasParticipated[ratingId][msg.sender] = true;
        
        // 更新明文参与计数（用于前端展示）
        rating.participantCount++;
        
        // 记录用户参与列表
        userParticipations[msg.sender].push(ratingId);

        emit RatingSubmitted(ratingId, msg.sender, block.timestamp);
    }

    /// @notice 提前结束评分（仅创建者可调用）
    /// @param ratingId 评分项目ID
    function endRatingEarly(uint256 ratingId) public {
        Rating storage rating = ratings[ratingId];
        
        if (!rating.exists) revert RatingNotExists();
        if (msg.sender != rating.creator) revert OnlyCreator();
        if (block.timestamp > rating.endTime) revert RatingEnded();

        uint256 originalEndTime = rating.endTime;
        rating.endTime = block.timestamp;

        emit RatingEndedEarly(ratingId, msg.sender, originalEndTime, block.timestamp);
    }

    /// @notice 授权解密（仅创建者可调用）
    /// @param ratingId 评分项目ID
    function allowDecryption(uint256 ratingId) public {
        Rating storage rating = ratings[ratingId];
        
        if (!rating.exists) revert RatingNotExists();
        if (msg.sender != rating.creator) revert OnlyCreator();
        if (block.timestamp <= rating.endTime) revert RatingNotEnded();

        // 授权创建者解密所有维度的加密总分
        for (uint256 i = 0; i < rating.dimensions.length; i++) {
            FHE.allow(encryptedDimensionSums[ratingId][i], msg.sender);
        }

        // 授权创建者解密参与计数
        FHE.allow(encryptedParticipantCounts[ratingId], msg.sender);

        // 标记结果已解密
        rating.resultsDecrypted = true;

        emit ResultsDecrypted(ratingId, msg.sender, block.timestamp);
    }

    /// @notice 获取加密结果（返回句柄用于前端解密）
    /// @param ratingId 评分项目ID
    /// @return dimensionSums 每个维度的加密总分数组
    /// @return participantCount 加密的参与人数
    function getEncryptedResults(uint256 ratingId)
        public
        view
        returns (euint32[] memory dimensionSums, euint32 participantCount)
    {
        Rating storage rating = ratings[ratingId];
        if (!rating.exists) revert RatingNotExists();

        dimensionSums = new euint32[](rating.dimensions.length);
        for (uint256 i = 0; i < rating.dimensions.length; i++) {
            dimensionSums[i] = encryptedDimensionSums[ratingId][i];
        }

        participantCount = encryptedParticipantCounts[ratingId];
    }

    /// @notice 获取评分项目信息
    /// @param ratingId 评分项目ID
    /// @return rating 评分项目结构体
    function getRating(uint256 ratingId)
        public
        view
        returns (Rating memory rating)
    {
        rating = ratings[ratingId];
        if (!rating.exists) revert RatingNotExists();
    }

    /// @notice 获取总评分项目数量
    /// @return count 评分项目总数
    function getRatingCount() public view returns (uint256 count) {
        return ratingCounter;
    }

    /// @notice 检查用户是否已参与某个评分
    /// @param ratingId 评分项目ID
    /// @param user 用户地址
    /// @return participated 是否已参与
    function getUserParticipated(uint256 ratingId, address user)
        public
        view
        returns (bool participated)
    {
        return hasParticipated[ratingId][user];
    }

    /// @notice 获取用户创建的所有评分项目ID
    /// @param user 用户地址
    /// @return ratingIds 评分项目ID数组
    function getUserCreations(address user)
        public
        view
        returns (uint256[] memory ratingIds)
    {
        return userCreations[user];
    }

    /// @notice 获取用户参与的所有评分项目ID
    /// @param user 用户地址
    /// @return ratingIds 评分项目ID数组
    function getUserParticipations(address user)
        public
        view
        returns (uint256[] memory ratingIds)
    {
        return userParticipations[user];
    }

    /// @notice 批量获取评分项目信息
    /// @param startId 起始ID
    /// @param count 获取数量
    /// @return ratingList 评分项目数组
    function getRatings(uint256 startId, uint256 count)
        public
        view
        returns (Rating[] memory ratingList)
    {
        uint256 endId = startId + count;
        if (endId > ratingCounter) {
            endId = ratingCounter;
        }

        uint256 actualCount = endId > startId ? endId - startId : 0;
        ratingList = new Rating[](actualCount);

        uint256 index = 0;
        for (uint256 i = startId; i < endId; i++) {
            if (ratings[i].exists) {
                ratingList[index] = ratings[i];
                index++;
            }
        }
    }
}


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ChitFundLedger
 * @dev Simplified smart contract for chit fund operations with INTMAX integration
 */
contract ChitFundLedger is Ownable, ReentrancyGuard {
    
    // Constants
    uint256 public constant INTEREST_RATE_BASIS_POINTS = 700; // 7%
    uint256 public constant MIN_MEMBERS = 3;
    uint256 public constant MAX_MEMBERS = 50;
    
    // Counters
    uint256 private _groupCounter;
    uint256 private _contributionCounter;
    uint256 private _payoutCounter;
    
    // Enums
    enum GroupType { PRIVATE, PUBLIC, COMMUNITY }
    enum ContributionStatus { PENDING, CONFIRMED, FAILED }
    enum PayoutStatus { PENDING, COMPLETED, FAILED }
    
    // Structs
    struct Group {
        uint256 id;
        string name;
        GroupType groupType;
        address creator;
        uint256 monthlyAmount;
        uint256 maxMembers;
        uint256 currentMembers;
        uint256 currentCycle;
        bool active;
        uint256 createdAt;
    }
    
    struct Member {
        address memberAddress;
        uint256 payoutOrder;
        bool hasReceivedPayout;
        bool active;
    }
    
    struct Contribution {
        uint256 id;
        uint256 groupId;
        address member;
        uint256 amount;
        ContributionStatus status;
        bool isTreasury;
        string intmaxTxHash;
    }
    
    struct Payout {
        uint256 id;
        uint256 groupId;
        address recipient;
        uint256 baseAmount;
        uint256 interestAmount;
        PayoutStatus status;
        string intmaxTxHash;
    }
    
    // State variables
    mapping(uint256 => Group) public groups;
    mapping(uint256 => mapping(address => Member)) public groupMembers;
    mapping(uint256 => address[]) public groupMembersList;
    mapping(uint256 => Contribution) public contributions;
    mapping(uint256 => Payout) public payouts;
    
    // Treasury wallet
    address public treasuryWallet;
    
    // Events
    event GroupCreated(uint256 indexed groupId, address indexed creator, string name);
    event MemberJoined(uint256 indexed groupId, address indexed member);
    event ContributionRecorded(uint256 indexed contributionId, uint256 indexed groupId, address indexed member, uint256 amount);
    event PayoutRecorded(uint256 indexed payoutId, uint256 indexed groupId, address indexed recipient, uint256 totalAmount);
    event TreasuryWalletUpdated(address indexed oldWallet, address indexed newWallet);
    
    // Modifiers
    modifier onlyTreasury() {
        require(msg.sender == treasuryWallet, "Only treasury wallet");
        _;
    }
    
    modifier validGroup(uint256 groupId) {
        require(groups[groupId].id != 0, "Group does not exist");
        require(groups[groupId].active, "Group not active");
        _;
    }
    
    constructor(address _treasuryWallet) Ownable(msg.sender) {
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        treasuryWallet = _treasuryWallet;
    }
    
    /**
     * @dev Create a new chit fund group
     */
    function createGroup(
        string memory _name,
        GroupType _groupType,
        uint256 _monthlyAmount,
        uint256 _maxMembers
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Group name required");
        require(_monthlyAmount > 0, "Monthly amount required");
        require(_maxMembers >= MIN_MEMBERS && _maxMembers <= MAX_MEMBERS, "Invalid member limit");
        
        _groupCounter++;
        uint256 newGroupId = _groupCounter;
        
        groups[newGroupId] = Group({
            id: newGroupId,
            name: _name,
            groupType: _groupType,
            creator: msg.sender,
            monthlyAmount: _monthlyAmount,
            maxMembers: _maxMembers,
            currentMembers: 1,
            currentCycle: 0,
            active: true,
            createdAt: block.timestamp
        });
        
        // Add creator as first member
        groupMembers[newGroupId][msg.sender] = Member({
            memberAddress: msg.sender,
            payoutOrder: 1,
            hasReceivedPayout: false,
            active: true
        });
        
        groupMembersList[newGroupId].push(msg.sender);
        
        emit GroupCreated(newGroupId, msg.sender, _name);
        return newGroupId;
    }
    
    /**
     * @dev Join an existing group
     */
    function joinGroup(uint256 groupId) external validGroup(groupId) {
        Group storage group = groups[groupId];
        require(group.currentMembers < group.maxMembers, "Group is full");
        require(!groupMembers[groupId][msg.sender].active, "Already a member");
        
        group.currentMembers++;
        
        groupMembers[groupId][msg.sender] = Member({
            memberAddress: msg.sender,
            payoutOrder: group.currentMembers,
            hasReceivedPayout: false,
            active: true
        });
        
        groupMembersList[groupId].push(msg.sender);
        
        emit MemberJoined(groupId, msg.sender);
    }
    
    /**
     * @dev Record a contribution (called by treasury service)
     */
    function recordContribution(
        uint256 groupId,
        address member,
        uint256 amount,
        bool isTreasury,
        string memory intmaxTxHash
    ) external onlyTreasury validGroup(groupId) {
        require(groupMembers[groupId][member].active, "Not a member");
        
        _contributionCounter++;
        
        contributions[_contributionCounter] = Contribution({
            id: _contributionCounter,
            groupId: groupId,
            member: member,
            amount: amount,
            status: ContributionStatus.CONFIRMED,
            isTreasury: isTreasury,
            intmaxTxHash: intmaxTxHash
        });
        
        emit ContributionRecorded(_contributionCounter, groupId, member, amount);
    }
    
    /**
     * @dev Record a payout (called by treasury service)
     */
    function recordPayout(
        uint256 groupId,
        address recipient,
        uint256 baseAmount,
        uint256 interestAmount,
        string memory intmaxTxHash
    ) external onlyTreasury validGroup(groupId) {
        require(groupMembers[groupId][recipient].active, "Not a member");
        
        _payoutCounter++;
        uint256 totalAmount = baseAmount + interestAmount;
        
        payouts[_payoutCounter] = Payout({
            id: _payoutCounter,
            groupId: groupId,
            recipient: recipient,
            baseAmount: baseAmount,
            interestAmount: interestAmount,
            status: PayoutStatus.COMPLETED,
            intmaxTxHash: intmaxTxHash
        });
        
        // Mark member as having received payout
        groupMembers[groupId][recipient].hasReceivedPayout = true;
        
        emit PayoutRecorded(_payoutCounter, groupId, recipient, totalAmount);
    }
    
    /**
     * @dev Calculate interest for later recipients
     */
    function calculateInterest(uint256 baseAmount, uint256 payoutOrder) external pure returns (uint256) {
        if (payoutOrder <= 2) {
            return 0; // No interest for first 2 recipients
        }
        return (baseAmount * INTEREST_RATE_BASIS_POINTS) / 10000;
    }
    
    /**
     * @dev Get group information
     */
    function getGroup(uint256 groupId) external view returns (Group memory) {
        return groups[groupId];
    }
    
    /**
     * @dev Get group members
     */
    function getGroupMembers(uint256 groupId) external view returns (address[] memory) {
        return groupMembersList[groupId];
    }
    
    /**
     * @dev Get member info in a group
     */
    function getMember(uint256 groupId, address memberAddress) external view returns (Member memory) {
        return groupMembers[groupId][memberAddress];
    }
    
    /**
     * @dev Get contribution by ID
     */
    function getContribution(uint256 contributionId) external view returns (Contribution memory) {
        return contributions[contributionId];
    }
    
    /**
     * @dev Get payout by ID
     */
    function getPayout(uint256 payoutId) external view returns (Payout memory) {
        return payouts[payoutId];
    }
    
    /**
     * @dev Get total groups count
     */
    function getTotalGroups() external view returns (uint256) {
        return _groupCounter;
    }
    
    /**
     * @dev Get total contributions count
     */
    function getTotalContributions() external view returns (uint256) {
        return _contributionCounter;
    }
    
    /**
     * @dev Get total payouts count
     */
    function getTotalPayouts() external view returns (uint256) {
        return _payoutCounter;
    }
    
    /**
     * @dev Update treasury wallet (only owner)
     */
    function updateTreasuryWallet(address newTreasuryWallet) external onlyOwner {
        require(newTreasuryWallet != address(0), "Invalid address");
        address oldWallet = treasuryWallet;
        treasuryWallet = newTreasuryWallet;
        emit TreasuryWalletUpdated(oldWallet, newTreasuryWallet);
    }
    
    /**
     * @dev Emergency pause group (only owner)
     */
    function pauseGroup(uint256 groupId) external onlyOwner validGroup(groupId) {
        groups[groupId].active = false;
    }
    
    /**
     * @dev Resume group (only owner)
     */
    function resumeGroup(uint256 groupId) external onlyOwner {
        require(groups[groupId].id != 0, "Group does not exist");
        groups[groupId].active = true;
    }
} 
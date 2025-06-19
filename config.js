// LunarCoin Configuration
const LUNARCOIN_CONFIG = {
    // Token Details
    name: 'LunarCoin',
    symbol: 'LUNAR',
    decimals: 18,
    totalSupply: '1000000000', // 1 Billion tokens
    
    // Pricing
    initialPrice: 0.001, // USD per token
    minPurchase: 1000, // Minimum tokens to purchase
    maxPurchase: 10000000, // Maximum tokens to purchase
    
    // Contract Details
    contractAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e',
    ownerAddress: '0x18de791726b62e68fd4e7b5c9de8a22354d05997',
    
    // Payment Addresses
    paymentAddresses: {
        bnb: '0x18de791726b62e68fd4e7b5c9de8a22354d05997',
        eth: '0x18de791726b62e68fd4e7b5c9de8a22354d05997'
    },
    
    // Network Configuration
    network: {
        chainId: '0x38', // BSC Mainnet
        chainName: 'Binance Smart Chain',
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        blockExplorer: 'https://bscscan.com/',
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
        }
    },
    
    // Tokenomics Distribution
    tokenomics: {
        publicSale: 50, // 50%
        liquidityPool: 20, // 20%
        development: 15, // 15%
        marketing: 10, // 10%
        team: 5 // 5% (locked)
    },
    
    // Social Links
    social: {
        twitter: 'https://twitter.com/lunarcoin',
        telegram: 'https://t.me/lunarcoin',
        discord: 'https://discord.gg/lunarcoin',
        github: 'https://github.com/lunarcoin'
    },
    
    // Features
    features: [
        {
            icon: 'fas fa-bolt',
            title: 'Lightning Fast',
            description: 'Built on BNB Chain for instant transactions with minimal fees',
            color: 'blue'
        },
        {
            icon: 'fas fa-shield-alt',
            title: 'Secure & Audited',
            description: 'Smart contracts audited by leading security firms',
            color: 'purple'
        },
        {
            icon: 'fas fa-users',
            title: 'Community Driven',
            description: 'Governed by the community with transparent voting',
            color: 'green'
        }
    ],
    
    // Roadmap
    roadmap: [
        {
            phase: 'Phase 1',
            title: 'Launch & Initial Distribution',
            items: ['Token Launch', 'Initial DEX Offering', 'Community Building']
        },
        {
            phase: 'Phase 2',
            title: 'Exchange Listings',
            items: ['Major CEX Listings', 'Liquidity Partnerships', 'Marketing Campaign']
        },
        {
            phase: 'Phase 3',
            title: 'Ecosystem Development',
            items: ['DeFi Integrations', 'NFT Marketplace', 'Mobile App']
        },
        {
            phase: 'Phase 4',
            title: 'Global Expansion',
            items: ['International Partnerships', 'Enterprise Solutions', 'Governance DAO']
        }
    ]
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LUNARCOIN_CONFIG;
}

// LunarCoin Web3 Integration
class LunarCoinApp {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.isConnected = false;
        this.lunarPrice = 0.001; // USD price per LUNAR
        this.bnbPrice = 300; // Mock BNB price in USD
        this.contractAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e';
        this.paymentAddress = '0x18de791726b62e68fd4e7b5c9de8a22354d05997'; // Payment address for BNB/ETH
        this.airdropAmount = 100; // 100 LUNAR tokens for airdrop
        this.claimedAirdrops = new Set(); // Track claimed airdrops
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.updatePurchaseForm();
        await this.checkWalletConnection();
    }

    setupEventListeners() {
        // Wallet connection
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        
        // Sign in modal
        document.getElementById('signInBtn').addEventListener('click', () => this.showSignInModal());
        document.getElementById('closeModal').addEventListener('click', () => this.hideSignInModal());
        document.getElementById('signInSubmit').addEventListener('click', () => this.handleEmailSignIn());
        document.getElementById('walletSignIn').addEventListener('click', () => this.handleWalletSignIn());
        
        // Purchase functionality
        document.getElementById('lunarAmount').addEventListener('input', () => this.updatePurchaseForm());
        document.getElementById('purchaseBtn').addEventListener('click', () => this.handlePurchase());
        document.getElementById('buyNowBtn').addEventListener('click', () => this.scrollToBuySection());
        
        // Airdrop functionality
        document.getElementById('connectWalletAirdrop').addEventListener('click', () => this.connectWalletForAirdrop());
        document.getElementById('claimAirdrop').addEventListener('click', () => this.handleAirdropClaim());
        document.getElementById('airdropEmail').addEventListener('input', () => this.validateAirdropForm());
        document.getElementById('airdropWallet').addEventListener('input', () => this.validateAirdropForm());
        document.getElementById('agreeTerms').addEventListener('change', () => this.validateAirdropForm());
        
        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    this.account = accounts[0];
                    this.isConnected = true;
                    this.updateWalletUI();
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        }
    }

    async connectWallet() {
        if (typeof window.ethereum === 'undefined') {
            this.showNotification('Please install MetaMask or another Web3 wallet!', 'error');
            return;
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.account = accounts[0];
            
            // Initialize Web3
            this.web3 = new Web3(window.ethereum);
            
            // Check if we're on BSC network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== '0x38') { // BSC Mainnet
                await this.switchToBSC();
            }
            
            this.isConnected = true;
            this.updateWalletUI();
            this.showNotification('Wallet connected successfully!', 'success');
            
        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.showNotification('Failed to connect wallet. Please try again.', 'error');
        }
    }

    async switchToBSC() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x38' }], // BSC Mainnet
            });
        } catch (switchError) {
            // If BSC is not added to wallet, add it
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x38',
                            chainName: 'Binance Smart Chain',
                            nativeCurrency: {
                                name: 'BNB',
                                symbol: 'BNB',
                                decimals: 18
                            },
                            rpcUrls: ['https://bsc-dataseed.binance.org/'],
                            blockExplorerUrls: ['https://bscscan.com/']
                        }]
                    });
                } catch (addError) {
                    console.error('Error adding BSC network:', addError);
                }
            }
        }
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connectWallet');
        const purchaseBtn = document.getElementById('purchaseBtn');
        
        if (this.isConnected && this.account) {
            connectBtn.textContent = `${this.account.slice(0, 6)}...${this.account.slice(-4)}`;
            connectBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            connectBtn.classList.remove('bg-gradient-to-r', 'from-blue-500', 'to-purple-600');
            
            purchaseBtn.disabled = false;
            purchaseBtn.textContent = 'Purchase LunarCoin';
            purchaseBtn.classList.remove('disabled:opacity-50');
        } else {
            connectBtn.textContent = 'Connect Wallet';
            purchaseBtn.disabled = true;
            purchaseBtn.textContent = 'Connect Wallet to Purchase';
        }
    }

    updatePurchaseForm() {
        const lunarAmount = document.getElementById('lunarAmount').value || 0;
        const bnbCostField = document.getElementById('bnbCost');
        
        if (lunarAmount >= 1000) {
            const usdCost = lunarAmount * this.lunarPrice;
            const bnbCost = (usdCost / this.bnbPrice).toFixed(6);
            bnbCostField.value = `${bnbCost} BNB (~$${usdCost.toFixed(2)})`;
        } else {
            bnbCostField.value = 'Minimum 1,000 LUNAR';
        }
    }

    async handlePurchase() {
        if (!this.isConnected) {
            this.showNotification('Please connect your wallet first!', 'error');
            return;
        }

        const lunarAmount = parseInt(document.getElementById('lunarAmount').value);
        
        if (!lunarAmount || lunarAmount < 1000) {
            this.showNotification('Minimum purchase is 1,000 LUNAR tokens!', 'error');
            return;
        }

        if (lunarAmount > 10000000) {
            this.showNotification('Maximum purchase is 10,000,000 LUNAR tokens!', 'error');
            return;
        }

        try {
            const usdCost = lunarAmount * this.lunarPrice;
            const bnbCost = usdCost / this.bnbPrice;
            const bnbWei = this.web3.utils.toWei(bnbCost.toString(), 'ether');

            // Transaction parameters for payment
            const transactionParams = {
                to: this.paymentAddress, // Use the provided payment address
                from: this.account,
                value: bnbWei,
                gas: '100000',
            };

            this.showNotification('Processing transaction...', 'info');
            
            // Mock transaction for demo purposes
            setTimeout(() => {
                this.showNotification(`Successfully purchased ${lunarAmount.toLocaleString()} LUNAR tokens!`, 'success');
                document.getElementById('lunarAmount').value = '';
                this.updatePurchaseForm();
            }, 2000);

            // In real implementation:
            // const txHash = await window.ethereum.request({
            //     method: 'eth_sendTransaction',
            //     params: [transactionParams],
            // });

        } catch (error) {
            console.error('Purchase error:', error);
            this.showNotification('Transaction failed. Please try again.', 'error');
        }
    }

    showSignInModal() {
        document.getElementById('signInModal').classList.remove('hidden');
    }

    hideSignInModal() {
        document.getElementById('signInModal').classList.add('hidden');
    }

    handleEmailSignIn() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            this.showNotification('Please fill in all fields!', 'error');
            return;
        }

        // Mock email sign in
        this.showNotification('Sign in functionality coming soon!', 'info');
        this.hideSignInModal();
    }

    async handleWalletSignIn() {
        this.hideSignInModal();
        await this.connectWallet();
    }

    scrollToBuySection() {
        document.getElementById('buy').scrollIntoView({ behavior: 'smooth' });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 translate-x-full`;
        
        // Set colors based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-600', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-600', 'text-white');
                break;
            case 'info':
                notification.classList.add('bg-blue-600', 'text-white');
                break;
            default:
                notification.classList.add('bg-gray-600', 'text-white');
        }
        
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }

    // Airdrop Methods
    async connectWalletForAirdrop() {
        await this.connectWallet();
        if (this.isConnected && this.account) {
            document.getElementById('airdropWallet').value = this.account;
            this.validateAirdropForm();
        }
    }

    validateAirdropForm() {
        const email = document.getElementById('airdropEmail').value;
        const wallet = document.getElementById('airdropWallet').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const claimBtn = document.getElementById('claimAirdrop');

        const isValidEmail = email && email.includes('@') && email.includes('.');
        const isValidWallet = wallet && wallet.startsWith('0x') && wallet.length === 42;
        const isFormValid = isValidEmail && isValidWallet && agreeTerms;

        claimBtn.disabled = !isFormValid;
        
        if (isFormValid) {
            claimBtn.classList.remove('opacity-50');
        } else {
            claimBtn.classList.add('opacity-50');
        }
    }

    async handleAirdropClaim() {
        const email = document.getElementById('airdropEmail').value;
        const wallet = document.getElementById('airdropWallet').value;
        
        // Check if already claimed
        const claimKey = `${email}-${wallet}`;
        if (this.claimedAirdrops.has(claimKey)) {
            this.showNotification('Airdrop already claimed for this email/wallet combination!', 'error');
            return;
        }

        // Validate inputs
        if (!email || !email.includes('@')) {
            this.showNotification('Please enter a valid email address!', 'error');
            return;
        }

        if (!wallet || !wallet.startsWith('0x') || wallet.length !== 42) {
            this.showNotification('Please enter a valid BNB Chain wallet address!', 'error');
            return;
        }

        try {
            this.showNotification('Processing airdrop claim...', 'info');

            // Simulate airdrop transaction
            setTimeout(() => {
                // Mark as claimed
                this.claimedAirdrops.add(claimKey);
                
                // Generate mock transaction hash
                const txHash = '0x' + Math.random().toString(16).substr(2, 64);
                
                // Show success
                this.showAirdropSuccess(txHash);
                this.showNotification(`Successfully claimed ${this.airdropAmount} LUNAR tokens!`, 'success');
                
                // Reset form
                this.resetAirdropForm();
            }, 2000);

            // In real implementation, this would interact with smart contract:
            // const airdropTx = await this.sendAirdropTransaction(wallet, this.airdropAmount);

        } catch (error) {
            console.error('Airdrop error:', error);
            this.showNotification('Airdrop claim failed. Please try again.', 'error');
        }
    }

    showAirdropSuccess(txHash) {
        document.getElementById('airdropForm').classList.add('hidden');
        document.getElementById('airdropSuccess').classList.remove('hidden');
        document.getElementById('airdropTxHash').textContent = txHash;
    }

    resetAirdropForm() {
        document.getElementById('airdropEmail').value = '';
        document.getElementById('airdropWallet').value = '';
        document.getElementById('agreeTerms').checked = false;
        this.validateAirdropForm();
        
        // Reset to form view after 10 seconds
        setTimeout(() => {
            document.getElementById('airdropForm').classList.remove('hidden');
            document.getElementById('airdropSuccess').classList.add('hidden');
        }, 10000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LunarCoinApp();
});

// Handle wallet account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            location.reload(); // Reload page if wallet disconnected
        } else {
            location.reload(); // Reload page if account changed
        }
    });

    window.ethereum.on('chainChanged', (chainId) => {
        location.reload(); // Reload page if network changed
    });
}

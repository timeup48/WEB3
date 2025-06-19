// LunarCoin Web3 Integration
class LunarCoinApp {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.isConnected = false;
        this.lunarPrice = 0.001; // USD price per LUNAR
        this.bnbPrice = 300; // Mock BNB price in USD
        this.contractAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e'; // Mock contract address
        
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

            // Simulate transaction (in real implementation, this would interact with smart contract)
            const transactionParams = {
                to: this.contractAddress,
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

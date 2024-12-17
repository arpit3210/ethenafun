# Deployment #1 Details

## Deployment Information
- Date: Initial Deployment
- Network: Ethena Testnet
- Deployer Address: 0x8Ab77353aC866B7Ab690890e620c249A8D3e92D0

## Contract Addresses
1. Game Contract: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
2. VRF Coordinator: [Address Not Recorded]
3. USDe Token (existing): `0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE`

## Initial State
- Owner: 0x8Ab77353aC866B7Ab690890e620c249A8D3e92D0
- Token: 0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE
- Initial Balance: 300.0 USDe

## Issues Encountered
- ❌ Automatic transfer of 100 USDe to contract
- ❌ Tokens locked in contract
- ❌ No recovery mechanism implemented

## Balance Changes
- Initial Balance: 300.0 USDe
- After Deployment: 200.0 USDe
- Lost Tokens: 100.0 USDe (automatically transferred to contract)

## Lessons Learned
1. Need to remove automatic token transfers
2. Implement fund recovery mechanism
3. Add balance checks and safeguards
4. Create better deployment documentation

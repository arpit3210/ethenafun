# Deployment #2 Details

## Deployment Information
- Date: Second Deployment
- Network: Ethena Testnet
- Deployer Address: 0x8Ab77353aC866B7Ab690890e620c249A8D3e92D0

## Contract Addresses
1. Game Contract: `0x7Ed53358127b0a863761fb40E2f52016C3c89526`
2. VRF Coordinator: [Address Not Recorded]
3. USDe Token (existing): `0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE`

## Initial State
- Owner: 0x8Ab77353aC866B7Ab690890e620c249A8D3e92D0
- Token: 0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE
- Initial Balance: 200.0 USDe

## Issues Encountered
- ❌ Another automatic transfer of 100 USDe
- ✅ Successfully recovered tokens later
- ❌ Still had automatic transfer in deployment

## Balance Changes
- Initial Balance: 200.0 USDe
- After Deployment: 100.0 USDe
- Lost Tokens: 100.0 USDe (recovered later)
- Final Balance After Recovery: 200.0 USDe

## Recovery Actions
1. Created recovery scripts
2. Successfully withdrew locked tokens
3. Implemented withdrawal functions

## Lessons Learned
1. Need for immediate testing after deployment
2. Importance of recovery mechanisms
3. Better token approval management needed

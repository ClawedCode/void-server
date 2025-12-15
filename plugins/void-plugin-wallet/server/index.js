const walletService = require('./wallet-service');

module.exports = (app, config = {}) => {
  const { mountPath = '/wallet' } = config;

  // Configure wallet service with RPC settings
  walletService.configure(config);

  // Get wallet groups
  app.get(`${mountPath}/api/wallet/groups`, async (req, res) => {
    console.log(`📋 GET ${mountPath}/api/wallet/groups`);
    const groups = walletService.getWalletGroups();
    const addressCount = groups.reduce((sum, g) => sum + g.addresses.length, 0);

    // Fetch balances for each address
    for (const group of groups) {
      for (const addr of group.addresses) {
        addr.balance = await walletService.getBalance(addr.publicKey).catch(() => 0);
      }
    }

    console.log(`✅ Loaded ${groups.length} groups with ${addressCount} addresses`);
    res.json({ success: true, groups });
  });

  // Get known tokens (must be before /:id route)
  app.get(`${mountPath}/api/wallet/known-tokens`, (req, res) => {
    console.log(`🪙 GET ${mountPath}/api/wallet/known-tokens`);
    const tokens = walletService.loadKnownTokens();
    const tokenCount = Object.keys(tokens.tokens).length;
    console.log(`✅ Loaded ${tokenCount} known tokens`);
    res.json({ success: true, tokens: tokens.tokens });
  });

  // Get settings (must be before /:id route)
  app.get(`${mountPath}/api/wallet/settings`, (req, res) => {
    console.log(`⚙️ GET ${mountPath}/api/wallet/settings`);
    const settings = walletService.getSettings();
    console.log(`✅ Settings retrieved`);
    res.json({ success: true, settings });
  });

  // Save settings (must be before /:id route)
  app.post(`${mountPath}/api/wallet/settings`, (req, res) => {
    const { heliusApiKey, jupiterApiKey, rpcUrl } = req.body;
    console.log(`⚙️ POST ${mountPath}/api/wallet/settings`);

    const result = walletService.saveSettings({
      heliusApiKey: heliusApiKey || null,
      jupiterApiKey: jupiterApiKey || null,
      rpcUrl: rpcUrl || null
    });

    if (result.success) {
      console.log(`✅ Settings saved`);
    } else {
      console.log(`❌ Failed to save settings: ${result.error}`);
    }
    res.json(result);
  });

  // Get wallet details with balances
  app.get(`${mountPath}/api/wallet/:id`, async (req, res) => {
    console.log(`👛 GET ${mountPath}/api/wallet/${req.params.id}`);
    const wallet = walletService.getWallet(req.params.id);
    if (!wallet) {
      console.log(`❌ Wallet not found: ${req.params.id}`);
      return res.status(404).json({ success: false, error: 'Wallet not found' });
    }

    wallet.balance = await walletService.getBalance(wallet.publicKey).catch(() => 0);
    wallet.tokens = await walletService.getTokenBalances(wallet.publicKey).catch(() => []);

    console.log(`✅ Loaded wallet ${wallet.label} (${wallet.balance.toFixed(4)} SOL)`);
    res.json({ success: true, wallet });
  });

  // Preview addresses from seed
  app.post(`${mountPath}/api/wallet/derive`, (req, res) => {
    const { seedPhrase, count = 10 } = req.body;
    console.log(`🔑 POST ${mountPath}/api/wallet/derive count=${count}`);
    if (!seedPhrase) {
      console.log(`❌ Seed phrase required`);
      return res.status(400).json({ success: false, error: 'Seed phrase required' });
    }

    const addresses = walletService.deriveAddresses(seedPhrase, count);
    console.log(`✅ Derived ${addresses.length} addresses`);
    res.json({ success: true, addresses });
  });

  // Create wallet
  app.post(`${mountPath}/api/wallet/create`, (req, res) => {
    const { name, seedPhrase, accountIndices = [0] } = req.body;
    console.log(`➕ POST ${mountPath}/api/wallet/create name="${name}" indices=[${accountIndices.join(',')}]`);
    if (!name || !seedPhrase) {
      console.log(`❌ Name and seed phrase required`);
      return res.status(400).json({ success: false, error: 'Name and seed phrase required' });
    }

    const result = walletService.createWallet(name, seedPhrase, accountIndices);
    if (result.success) {
      console.log(`✅ Created wallet "${name}" with ${result.addresses.length} addresses`);
    } else {
      console.log(`❌ Failed to create wallet: ${result.error}`);
    }
    res.json(result);
  });

  // Derive more addresses from existing wallet
  app.post(`${mountPath}/api/wallet/:id/derive-more`, (req, res) => {
    const { count = 20 } = req.body;
    console.log(`🔄 POST ${mountPath}/api/wallet/${req.params.id}/derive-more count=${count}`);
    const result = walletService.deriveMoreAddresses(req.params.id, count);
    if (result.success) {
      console.log(`✅ Derived ${result.wallets.length} addresses`);
    } else {
      console.log(`❌ Failed to derive: ${result.error}`);
    }
    res.json(result);
  });

  // Get seed phrase for wallet group
  app.get(`${mountPath}/api/wallet/:id/seed`, (req, res) => {
    console.log(`🔐 GET ${mountPath}/api/wallet/${req.params.id}/seed`);
    const result = walletService.getSeedPhrase(req.params.id);
    if (result.success) {
      console.log(`✅ Seed phrase retrieved`);
    } else {
      console.log(`❌ Failed to get seed: ${result.error}`);
    }
    res.json(result);
  });

  // Import additional addresses
  app.post(`${mountPath}/api/wallet/:id/import-addresses`, (req, res) => {
    const { accountIndices, baseName } = req.body;
    console.log(`📥 POST ${mountPath}/api/wallet/${req.params.id}/import-addresses indices=[${accountIndices?.join(',') || ''}]`);
    if (!accountIndices || !Array.isArray(accountIndices)) {
      console.log(`❌ accountIndices array required`);
      return res.status(400).json({ success: false, error: 'accountIndices array required' });
    }

    const result = walletService.importAdditionalAddresses(
      req.params.id,
      accountIndices,
      baseName || 'Wallet'
    );
    if (result.success) {
      console.log(`✅ Imported ${result.addresses.length} addresses`);
    } else {
      console.log(`❌ Failed to import: ${result.error}`);
    }
    res.json(result);
  });

  // Delete wallet
  app.delete(`${mountPath}/api/wallet/:id`, (req, res) => {
    console.log(`🗑️ DELETE ${mountPath}/api/wallet/${req.params.id}`);
    const result = walletService.deleteWallet(req.params.id);
    if (result.success) {
      console.log(`✅ Deleted: ${result.deleted}`);
    } else {
      console.log(`❌ Failed to delete: ${result.error}`);
    }
    res.json(result);
  });

  // Update address label
  app.patch(`${mountPath}/api/wallet/:id/label`, (req, res) => {
    const { label } = req.body;
    console.log(`✏️ PATCH ${mountPath}/api/wallet/${req.params.id}/label label="${label}"`);
    if (!label) {
      console.log(`❌ Label required`);
      return res.status(400).json({ success: false, error: 'Label required' });
    }

    const result = walletService.updateLabel(req.params.id, label);
    if (result.success) {
      console.log(`✅ Updated label to "${label}"`);
    } else {
      console.log(`❌ Failed to update label: ${result.error}`);
    }
    res.json(result);
  });

  // Send transaction
  app.post(`${mountPath}/api/wallet/:id/send`, async (req, res) => {
    const { recipient, amount, tokenMint } = req.body;
    console.log(`💸 POST ${mountPath}/api/wallet/${req.params.id}/send to=${recipient?.slice(0, 8)}... amount=${amount} ${tokenMint ? 'token=' + tokenMint.slice(0, 8) + '...' : 'SOL'}`);
    if (!recipient || amount === undefined) {
      console.log(`❌ Recipient and amount required`);
      return res.status(400).json({ success: false, error: 'Recipient and amount required' });
    }

    const result = await walletService.sendTransaction({
      walletId: req.params.id,
      recipient,
      amount: parseFloat(amount),
      tokenMint
    });
    if (result.success) {
      console.log(`✅ Transaction sent: ${result.signature?.slice(0, 16)}...`);
    } else {
      console.log(`❌ Transaction failed: ${result.error}`);
    }
    res.json(result);
  });

  // Sign message
  app.post(`${mountPath}/api/wallet/sign`, (req, res) => {
    const { publicKey, message } = req.body;
    console.log(`✍️ POST ${mountPath}/api/wallet/sign key=${publicKey?.slice(0, 8)}... msg="${message?.slice(0, 20)}..."`);
    if (!publicKey || !message) {
      console.log(`❌ Public key and message required`);
      return res.status(400).json({ success: false, error: 'Public key and message required' });
    }

    try {
      const result = walletService.signMessage(publicKey, message);
      if (result.success) {
        console.log(`✅ Message signed`);
      } else {
        console.log(`❌ Failed to sign: ${result.error}`);
      }
      res.json(result);
    } catch (err) {
      console.error(`❌ Sign message error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to sign message' });
    }
  });

  // Buy token with SOL
  app.post(`${mountPath}/api/wallet/:id/buy`, async (req, res) => {
    const { tokenMint, solAmount } = req.body;
    console.log(`🛒 POST ${mountPath}/api/wallet/${req.params.id}/buy token=${tokenMint?.slice(0, 8)}... amount=${solAmount} SOL`);
    if (!tokenMint || solAmount === undefined) {
      console.log(`❌ Token mint and SOL amount required`);
      return res.status(400).json({ success: false, error: 'Token mint and SOL amount required' });
    }

    const result = await walletService.buyToken({
      walletId: req.params.id,
      tokenMint,
      solAmount: parseFloat(solAmount)
    });
    if (result.success) {
      console.log(`✅ Bought ${result.outputAmount} ${result.tokenSymbol}: ${result.signature?.slice(0, 16)}...`);
    } else {
      console.log(`❌ Buy failed: ${result.error}`);
    }
    res.json(result);
  });

};

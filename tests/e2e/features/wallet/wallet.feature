@ui
Feature: Wallet Plugin
  As a user
  I want to manage Solana wallets
  So that I can interact with the blockchain

  Background:
    Given the wallet plugin is enabled
    And I am on the wallet page

  @smoke
  Scenario: Wallet page loads
    Then I should see the wallet interface

  @wallet-crud
  Scenario: Create wallet from seed phrase
    When I click the create wallet button
    And I enter a valid seed phrase
    And I enter wallet name "Test Wallet"
    And I complete the wallet creation
    Then a wallet should be created

  @api @smoke
  Scenario: API - List wallet groups
    When I GET "/wallet/api/wallet/groups"
    Then the response should be successful

  @api
  Scenario: API - Derive addresses preview
    When I POST to "/wallet/api/wallet/derive" with a seed phrase
    Then the response should contain derived addresses

  @api @smoke
  Scenario: API - Get known tokens
    When I GET "/wallet/api/wallet/known-tokens"
    Then the response should be successful
    And the response should have "tokens" object

  @api @smoke
  Scenario: API - Get wallet settings
    When I GET "/wallet/api/wallet/settings"
    Then the response should be successful
    And the response should have "settings" object

  @api
  Scenario: API - Derive requires seed phrase
    When I POST to "/wallet/api/wallet/derive" with empty body
    Then the response status should be 400
    And the response should contain "Seed phrase required"

  @api
  Scenario: API - Create wallet requires name and seed
    When I POST to "/wallet/api/wallet/create" with empty body
    Then the response status should be 400
    And the response should contain "Name and seed phrase required"

  @api
  Scenario: API - Sign message requires publicKey and message
    When I POST to "/wallet/api/wallet/sign" with empty body
    Then the response status should be 400
    And the response should contain "Public key and message required"

  @api
  Scenario: API - Get non-existent wallet
    When I GET "/wallet/api/wallet/non-existent-wallet-id"
    Then the response status should be 404
    And the response should contain "Wallet not found"

  @api
  Scenario: API - Update label requires label
    When I PATCH "/wallet/api/wallet/test-id/label" with empty body
    Then the response status should be 400
    And the response should contain "Label required"

  @api
  Scenario: API - Send requires recipient and amount
    When I POST to "/wallet/api/wallet/test-id/send" with empty body
    Then the response status should be 400
    And the response should contain "Recipient and amount required"

  @api
  Scenario: API - Buy token requires tokenMint and amount
    When I POST to "/wallet/api/wallet/test-id/buy" with empty body
    Then the response status should be 400
    And the response should contain "Token mint and SOL amount required"

  @api
  Scenario: API - Import addresses requires accountIndices
    When I POST to "/wallet/api/wallet/test-id/import-addresses" with empty body
    Then the response status should be 400
    And the response should contain "accountIndices array required"

  @api
  Scenario: API - Save wallet settings
    When I POST to "/wallet/api/wallet/settings" with empty settings
    Then the response should be successful

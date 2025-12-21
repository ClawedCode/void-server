@ui
Feature: Chat System
  As a user
  I want to chat with the AI
  So that I can have conversations

  Background:
    Given I am on the chat page

  @smoke
  Scenario: Chat page loads
    Then I should see the chat interface
    And I should see the chat sidebar

  @requires-lmstudio @smoke
  Scenario: Create new chat
    Given at least one AI provider is enabled
    When I click the "New Chat" button
    Then a new chat should be created

  @requires-lmstudio
  Scenario: Send message and receive response
    Given I have an active chat
    When I type "Hello, how are you?" in the message input
    And I send the message
    Then my message should appear in the chat
    And I should receive an AI response

  @api @smoke
  Scenario: API - List chats
    When I GET "/api/chat"
    Then the response should be successful

  @api
  Scenario: API - Create chat session
    When I POST to "/api/chat" with a template
    Then the response should contain a chat id

  # Conversation Branching Tests

  @api @smoke
  Scenario: API - List branches for a chat
    Given I have a chat with messages
    When I GET the chat branches
    Then the response should contain at least one branch

  @api
  Scenario: API - Create a branch from a message
    Given I have a chat with messages
    When I create a branch from the first message
    Then the response should contain the new branch
    And the chat should have 2 branches

  @api
  Scenario: API - Get tree structure
    Given I have a chat with messages
    When I GET the chat tree structure
    Then the response should contain tree nodes
    And each node should have an id and role

  @api
  Scenario: API - Switch between branches
    Given I have a chat with multiple branches
    When I switch to a different branch
    Then the active branch should change
    And I should get messages for that branch

  @ui
  Scenario: View conversation tree page
    Given I have a chat with multiple branches
    When I navigate to the tree view page
    Then I should see the tree visualization
    And I should see zoom controls

  @ui
  Scenario: Branch indicator shows when multiple branches
    Given I have a chat with multiple branches
    And I am viewing that chat
    Then I should see the branch indicator badge
    And it should show the branch count

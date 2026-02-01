@requires-neo4j @ui
Feature: Memories System
  As a user
  I want to manage memories in the knowledge graph
  So that the AI can maintain context

  Background:
    Given Neo4j is running and configured
    And I am on the memories page

  @smoke @requires-neo4j
  Scenario: Memories page loads
    Then I should see the "Memories" heading
    And I should see the memory list or empty state

  @requires-neo4j
  Scenario: Create and delete memory
    When I click the "New Memory" button
    And I fill in the memory form
    And I save the memory
    Then the memory should appear in the list
    # Cleanup
    When I delete the test memory
    Then the test memory should be removed

  @requires-neo4j
  Scenario: Search memories
    Given I have memories in the system
    When I search for "test"
    Then I should see matching memories

  @requires-neo4j
  Scenario: View memory graph
    When I click the "Visualization" tab
    Then I should see the graph visualization

  @api @requires-neo4j @smoke
  Scenario: API - List memories
    When I GET "/api/memories"
    Then the response should contain memories

  @api @requires-neo4j
  Scenario: API - Get memory stats
    When I GET "/api/memories/stats"
    Then the response should contain statistics

  # Memory Toggle Tests

  @api @requires-neo4j
  Scenario: API - Toggle memory system off
    When I POST to "/api/memories/toggle" with enabled false
    Then the response should indicate memory is disabled

  @api @requires-neo4j
  Scenario: API - Toggle memory system on
    When I POST to "/api/memories/toggle" with enabled true
    Then the response should indicate memory is enabled

  @ui @requires-neo4j
  Scenario: Memory toggle switch on settings tab
    When I click the "Settings" tab
    Then I should see the memory toggle switch
    And the toggle should reflect the current memory state

  # ============ API Tests (don't require Neo4j) ============

  @api @smoke
  Scenario: API - Get Neo4j connection status
    When I GET "/api/memories/status"
    Then the response should be successful
    And the response should have "neo4j" object

  @api @smoke
  Scenario: API - Get Neo4j configuration
    When I GET "/api/memories/config"
    Then the response should be successful
    And the response should have "config" object

  @api
  Scenario: API - Get embedding service status
    When I GET "/api/memories/embedding/status"
    Then the response should be successful
    And the response should have embedding status

  @api
  Scenario: API - List embedding models
    When I GET "/api/memories/embedding/models"
    Then the response should be successful

  @api
  Scenario: API - Search requires query parameter
    When I GET "/api/memories/search"
    Then the response status should be 400
    And the response should contain "required"

  @api
  Scenario: API - Search with query
    When I GET "/api/memories/search?q=test"
    Then the response should be successful
    And the response should have "memories" array

  @api
  Scenario: API - Filter memories
    When I GET "/api/memories/filter?category=General"
    Then the response should be successful
    And the response should have "memories" array

  @api
  Scenario: API - Get graph data
    When I GET "/api/memories/graph"
    Then the response should be successful
    And the response should have graph data

  @api
  Scenario: API - Get context memories
    When I GET "/api/memories/context?message=hello"
    Then the response should be successful
    And the response should have "memories" array

  @api
  Scenario: API - Bulk delete requires ids array
    When I POST to "/api/memories/maintenance/bulk-delete" with empty body
    Then the response status should be 400
    And the response should contain "ids array required"

  @api
  Scenario: API - Smart connect requires ids array
    When I POST to "/api/memories/maintenance/smart-connect" with empty body
    Then the response status should be 400
    And the response should contain "ids array required"

  @api
  Scenario: API - Switch embedding provider
    When I PUT to "/api/memories/embedding/provider" with provider "auto"
    Then the response should be successful

  @api
  Scenario: API - Invalid embedding provider rejected
    When I PUT to "/api/memories/embedding/provider" with provider "invalid"
    Then the response status should be 400
    And the response should contain "Invalid provider"

  @api @requires-neo4j
  Scenario: API - Get memory by non-existent ID
    When I GET "/api/memories/non-existent-id"
    Then the response status should be 404

  @api @requires-neo4j
  Scenario: API - Sync memories to Neo4j
    When I POST to "/api/memories/sync"
    Then the response should be successful

  @api @requires-neo4j
  Scenario: API - Get maintenance data
    When I GET "/api/memories/maintenance/all"
    Then the response should be successful

  @api @requires-neo4j
  Scenario: API - Preview auto-fix suggestions
    When I POST to "/api/memories/maintenance/auto-fix/preview"
    Then the response should be successful

  @api @requires-neo4j
  Scenario: API - Apply auto-fix requires fixes array
    When I POST to "/api/memories/maintenance/auto-fix/apply" with empty body
    Then the response status should be 400
    And the response should contain "fixes array required"

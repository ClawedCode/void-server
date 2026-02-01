@api
Feature: Backup System
  As an administrator
  I want to manage database backups
  So that I can protect my data

  @smoke
  Scenario: Get backup status
    When I GET "/api/backup/status"
    Then the response should be successful
    And the response should contain backup status

  @smoke
  Scenario: Get backup history
    When I GET "/api/backup/history"
    Then the response should be successful
    And the response should have "backups" array

  Scenario: List available backups
    When I GET "/api/backup/list"
    Then the response should be successful
    And the response should have "backups" array

  Scenario: Run health check
    When I GET "/api/backup/health"
    Then the response should be successful
    And the response should contain health check results

  Scenario: Toggle backup automation off
    When I POST to "/api/backup/toggle" with enabled false
    Then the response should be successful
    And the response should indicate backup automation is disabled

  Scenario: Toggle backup automation on
    When I POST to "/api/backup/toggle" with enabled true
    Then the response should be successful
    And the response should indicate backup automation is enabled

  Scenario: Update backup configuration
    When I POST to "/api/backup/config" with backup settings
    Then the response should be successful

  @requires-neo4j
  Scenario: Run manual backup
    When I POST to "/api/backup/run"
    Then the response should be successful
    And the response should contain backup result

  Scenario: Restore requires fileName
    When I POST to "/api/backup/restore" with empty body
    Then the response status should be 400
    And the response should contain "fileName is required"

  Scenario: Restore upload requires valid backup data
    When I POST to "/api/backup/restore/upload" with empty body
    Then the response status should be 400
    And the response should contain "Invalid backup data"

  @requires-neo4j
  Scenario: Full backup and restore cycle
    # Create a backup
    When I POST to "/api/backup/run"
    Then the response should be successful
    And I store the backup filename
    # List backups to verify it exists
    When I GET "/api/backup/list"
    Then the stored backup should be in the list

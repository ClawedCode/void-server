@ui
Feature: Version and Updates
  As a user
  I want to check for and apply updates
  So that I can keep the application current

  @smoke @api
  Scenario: Get current version
    When I GET "/api/version"
    Then the response should contain the version

  @api
  Scenario: Check for updates
    When I GET "/api/version/check"
    Then the response should contain update information

  @api
  Scenario: Get environment info
    When I GET "/api/version/environment"
    Then the response should contain environment info
    And the response should indicate update method

  @api @docker
  Scenario: Docker update endpoint rejects non-Docker
    Given I am running native installation
    When I POST to "/api/version/update/docker"
    Then the response should indicate failure

  @api @native
  Scenario: Native update endpoint rejects Docker
    Given I am running in Docker
    When I POST to "/api/version/update"
    Then the response should indicate Docker error

  @native
  Scenario: Native update available notification
    Given an update is available
    And I am running native installation
    Then I should see the update notification

  @docker
  Scenario: Docker update notification
    Given an update is available
    And I am running in Docker
    Then I should see Docker-specific update instructions

  @docker
  Scenario: Docker update triggers Watchtower
    Given I am running in Docker
    And Watchtower is available
    When I click the update button
    Then I should see "Update triggered" message

  @docker
  Scenario: Docker update shows manual command when Watchtower unavailable
    Given I am running in Docker
    And Watchtower is not available
    When I click the update button
    Then I should see the Docker command modal
    And I should see Watchtower error message

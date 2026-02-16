## ADDED Requirements

### Requirement: Debounce search input at 300ms
The system SHALL debounce user keyboard input by 300ms before firing an API request to Open Library. This reduces unnecessary API calls during fast typing.

#### Scenario: User types quickly
- **WHEN** user types "think" in under 300ms
- **THEN** only one API request fires (for the final input value)

#### Scenario: User pauses typing
- **WHEN** user types "think" and pauses for 300ms
- **THEN** the system fires one API request for "think"

### Requirement: Cancel in-flight requests on new input
The system SHALL use AbortController to cancel any in-flight Open Library API request when new input arrives. This prevents stale results from appearing after newer searches.

#### Scenario: New input while request pending
- **WHEN** user types "think" (request fires), then types "thinking" before response arrives
- **THEN** the first request is aborted and only the "thinking" results are displayed

### Requirement: Show loading state during search
The system SHALL display a loading indicator while waiting for Open Library API results.

#### Scenario: Search in progress
- **WHEN** an API request is in flight
- **THEN** the system displays a loading spinner or skeleton state

#### Scenario: Search completes
- **WHEN** the API response arrives
- **THEN** the loading indicator is replaced with results (or no-results message)

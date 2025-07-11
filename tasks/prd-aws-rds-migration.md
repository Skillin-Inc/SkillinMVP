# Product Requirements Document (PRD): AWS RDS Aurora Migration

## 1. Introduction/Overview

This feature migrates the Skillin MVP backend from using local PostgreSQL to AWS RDS Aurora (PostgreSQL-compatible) with AWS Secrets Manager for secure credential management. The migration will enable better scalability, reliability, and integration with other AWS services while maintaining development workflow efficiency.

**Problem**: The current local PostgreSQL setup limits scalability, team collaboration, and integration with AWS services already in use (Cognito). 

**Goal**: Seamlessly migrate to AWS RDS Aurora with minimal code changes while implementing secure credential management through AWS Secrets Manager.

## 2. Goals

1. **Primary**: Replace local PostgreSQL connection with AWS RDS Aurora connection using AWS Secrets Manager
2. **Security**: Implement secure credential management eliminating hardcoded database credentials
3. **Reliability**: Add robust error handling with fallback mechanisms and clear error messaging
4. **Maintainability**: Preserve existing database functions and query structure
5. **Scalability**: Enable future horizontal scaling through Aurora's capabilities

## 3. User Stories

**As a developer**, I want to connect to AWS RDS instead of local PostgreSQL so that I can collaborate with team members using a shared database.

**As a developer**, I want secure credential management so that database credentials are not exposed in code or environment files.

**As a system administrator**, I want reliable error handling so that I can quickly diagnose and resolve connectivity issues.

**As a developer**, I want the migration to be transparent so that existing database queries and functions continue working without modification.

## 4. Functional Requirements

### Core Migration Requirements
1. **FR-001**: The system must connect to AWS RDS Aurora (PostgreSQL-compatible) instead of local PostgreSQL
2. **FR-002**: The system must retrieve database credentials from AWS Secrets Manager using the provided secret name `rds!cluster-d1aab255-8b30-49d0-a107-f2cc5e0c5cc6`
3. **FR-003**: The system must maintain all existing database functions in `backend/src/db.ts` without modification
4. **FR-004**: The system must preserve the existing `pg` Pool connection pattern

### Security Requirements  
5. **FR-005**: The system must use AWS Secrets Manager to securely retrieve database credentials
6. **FR-006**: The system must not store database credentials in environment variables or code
7. **FR-007**: The system must use AWS region `us-east-2` for Secrets Manager client configuration

### Error Handling Requirements
8. **FR-008**: The system must implement retry logic with exponential backoff for AWS service calls
9. **FR-009**: The system must provide clear error messages for connection failures
10. **FR-010**: The system must gracefully handle AWS Secrets Manager unavailability
11. **FR-011**: The system must log connection attempts and failures for debugging

### Configuration Requirements
12. **FR-012**: The system must support environment-based configuration (dev/staging/production)
13. **FR-013**: The system must allow override of AWS region through environment variables
14. **FR-014**: The system must allow override of secret name through environment variables

### Database Setup Requirements
15. **FR-015**: The `setup-database.ts` script must work with the new RDS connection
16. **FR-016**: The database schema and sample data import must function unchanged

## 5. Non-Goals (Out of Scope)

1. **Data Migration**: No actual data transfer from local to RDS (data migration handled separately)
2. **Schema Changes**: No modifications to existing database schema or table structures
3. **Query Optimization**: No changes to existing SQL queries or database functions
4. **Multiple Environment Management**: Single RDS instance for dev environment only
5. **IAM Database Authentication**: Using username/password authentication only
6. **Connection Pooling Changes**: No modifications to existing Pool configuration beyond connection string

## 6. Technical Considerations

### Current Architecture Analysis
- **Database Layer**: `backend/src/db.ts` uses `pg.Pool` with `DATABASE_URL` environment variable
- **Setup Script**: `backend/setup-database.ts` creates schema and inserts sample data
- **Local Configuration**: Currently using `postgres://shovang:1976@localhost:5432/skillinDB`
- **AWS Integration**: Already using AWS Cognito (`us-west-2`) and `@aws-sdk/client-secrets-manager` package

### Implementation Requirements
- **AWS SDK**: Utilize existing `@aws-sdk/client-secrets-manager` dependency
- **Connection Pattern**: Replace environment variable with dynamic secret retrieval
- **Error Handling**: Implement try-catch blocks with specific AWS error handling
- **Environment Variables**: Add `AWS_REGION` and `RDS_SECRET_NAME` for configuration flexibility

### Dependencies
- No new package dependencies required
- Must integrate with existing AWS Cognito authentication system
- Must maintain compatibility with existing Express.js route handlers

## 7. Design Considerations

### Database Connection Architecture
```
[Application] → [AWS Secrets Manager] → [RDS Aurora Credentials] → [PostgreSQL Pool] → [RDS Aurora]
```

### Error Handling Flow
1. **AWS Secrets Manager Call** → Retry with exponential backoff on failure
2. **Database Connection** → Clear error messaging for connection issues
3. **Fallback Strategy** → Log errors and provide actionable error messages

### Environment Configuration
- **Development**: Use provided secret name and `us-east-2` region
- **Future Environments**: Support configurable secret names and regions

## 8. Success Metrics

1. **Connectivity**: 100% successful connection to RDS Aurora within 5 seconds
2. **Reliability**: Less than 1% connection failure rate under normal conditions
3. **Performance**: No degradation in query response times compared to local PostgreSQL
4. **Security**: Zero exposed credentials in codebase or logs
5. **Maintainability**: No breaking changes to existing database function signatures

## 9. Implementation Requirements

### Files to Modify
1. **`backend/src/db.ts`**: Update Pool initialization to use AWS Secrets Manager
2. **`backend/setup-database.ts`**: Update to work with new connection method
3. **Environment Configuration**: Add AWS region and secret name configuration

### Code Changes Required
1. **Secret Retrieval Function**: Implement AWS Secrets Manager client and secret parsing
2. **Connection Initialization**: Replace `process.env.DATABASE_URL` with dynamic secret retrieval
3. **Error Handling**: Add comprehensive error handling for AWS and database operations
4. **Configuration**: Add environment variable support for AWS settings

### Testing Requirements
1. **Connection Testing**: Verify successful RDS Aurora connection
2. **Error Scenario Testing**: Test AWS Secrets Manager unavailability
3. **Function Preservation**: Ensure all existing database functions work unchanged
4. **Setup Script Testing**: Verify database setup script functions correctly

## 10. Open Questions

1. **Environment Management**: Should we plan for separate secrets for future staging/production environments?
2. **Connection Pooling**: Are there any specific Aurora connection pooling optimizations we should implement?
3. **Monitoring**: Do we need to implement connection health monitoring or metrics collection?
4. **Backup Strategy**: Should we document the RDS backup and restore procedures as part of this migration?

---

**Target Implementation Timeline**: 1-2 development days
**Complexity Level**: Medium (AWS integration with existing PostgreSQL setup)
**Risk Level**: Low (no data migration, preserving existing functionality) 
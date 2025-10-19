# Uangku Documentation Structure

## Updated Folder Organization

### 📋 `/docs/` - Root Documentation Directory

#### 🏗️ `app-docs/` - Technical Architecture (For Developers)
- `SystemDesign.md` - Architecture and technical overview
- `DataModel.md` - Database schema and relationships
- `TechStack.md` - Technology stack and development guidelines
- `UI_Guidelines.md` - UI/UX design principles and components

#### 🎯 `feature-planning/` - Product Planning (For Product Team)
- `PRD.md` - Product requirements and vision
- `Roadmap.md` - Feature roadmap and priorities
- `Development-Planning.md` - Development process and best practices
- `feature-plans/` - Individual feature specifications:
  - `application-enhancements.md` - Application improvements and bug fixes
  - `application-enhancements-v2.md` - Enhanced application improvements and UX enhancements
  - `authentication-migration.md` - Authentication system migration (Clerk to BetterAuth)
  - `budgeting-tools.md` - Budgeting system implementation
  - `currency-support.md` - Multi-currency implementation
  - `ai-text-input.md` - AI transaction input implementation
  - `goals-feature.md` - Goals tracking implementation
  - `bill-reminders.md` - Bill reminder system implementation
  - `transaction-budget-deduction-issue.md` - Issue resolution documentation (implemented)
  - `wallet-budget-mismatch-issue.md` - Issue resolution documentation (implemented)
  - `pwa-implementation.md` - PWA functionality implementation (offline & push notifications)

#### 👥 `user-docs/` - User Documentation (For End Users)
- `Changelog.md` - Version history and feature updates
- `user-guides/` - User guides:
  - `budgeting-tools.md` - User guide for budgeting features
  - `goals-feature.md` - User guide for goal tracking
  - `bills-feature.md` - User guide for bill reminders
  - `ai-transaction-input.md` - User guide for AI transaction input
  - `export-feature.md` - User guide for export functionality
  - `toast-notifications.md` - User guide for toast notification features

#### 🛠️ `additional-docs/` - Implementation & Testing (For Developers)
- `PWA_IMPLEMENTATION_SUMMARY.md` - PWA implementation details and changes
- `TESTING_OFFLINE.md` - Comprehensive testing guide for offline functionality

### 📚 Root Level Documentation Files
- `README.md` - Quick start guide and overview
- `INDEX.md` - Comprehensive documentation index
- `EXECUTIVE_SUMMARY.md` - Executive summary of the entire project
- `DEVELOPMENT_PLAN.md` - Current development priorities and roadmap
- `IMMEDIATE_TASKS.md` - Immediate next steps and task breakdown
- `IMPLEMENTATION_SUMMARY.md` - Enhanced accessibility & offline functionality implementation
- `PRODUCTION_READY.md` - Production readiness status
- `DEPLOYMENT_READY.md` - Deployment readiness status
- `PRODUCTION_DEPLOYMENT_SUMMARY.md` - Production deployment summary
- `PRODUCTION_RELEASE.md` - Production release status

## Navigation Guide

### For Different Audiences
- **New Developers**: Start with `README.md` → `app-docs/SystemDesign.md` → `app-docs/TechStack.md`
- **Product Managers**: Start with `README.md` → `feature-planning/PRD.md` → `feature-planning/Roadmap.md`
- **End Users**: Start with `README.md` → `user-docs/Changelog.md` → `user-docs/user-guides/`
- **Maintainers**: Use `INDEX.md` for comprehensive navigation
- **Executives**: Read `EXECUTIVE_SUMMARY.md` for project overview

## Documentation Principles
- **Clarity Over Completeness**: Focus on essential information
- **User-Centric**: Organize by user needs and developer workflows
- **Logical Grouping**: Related documentation grouped in intuitive directories
- **Easy Navigation**: Clear entry points and cross-references
- **Comprehensive Coverage**: All aspects of the project documented appropriately

## Quick Access
- **Complete Index**: `docs/INDEX.md` - All documentation in one organized view
- **Executive Overview**: `docs/EXECUTIVE_SUMMARY.md` - Project summary for leadership
- **Quick Start**: `docs/README.md` - Immediate entry points for different audiences
- **Maintainable**: Keep documents concise and up-to-date
- **Purpose-Driven**: Each document should serve a clear audience
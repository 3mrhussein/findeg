# Core infrastructure

Core owns session/token transport, request-cookie adapters, logging, storage and
cache interfaces, generic collection/mapping utilities, service results and error
mapping. It does not own Customer or Staff account rules, permissions or catalogue
business rules. Domain remains the single source of business values and rules.

Temporary entries under `core/domain` and `core/schemas` re-export contracts for
existing consumers. They contain no context implementation. New consumers use the
owning feature's entry; these delegates can disappear with package extraction.

| Former core contract | Owner and backend entry | Package destination |
| --- | --- | --- |
| AuthResult, UserWithPassword, UserVO, identity identifiers, permission predicates, login/logout messages | `identity/contracts` | identity |
| Locale/translation adapters, catalogue cache tags, catalogue DTO defaults/messages | `catalog/contracts` | catalog |
| Media metadata contracts | `media/contracts` | backend media infrastructure |
| Notification DTO | `notifications/contracts` | backend notifications infrastructure |
| Order success messages | `@findeg/orders` | orders |
| SessionPayload, CurrentSessionProvider, JWT/cookie adapters, token settings | core | backend core infrastructure |
| HTTP error catalogue and error-to-response mapping | core | backend infrastructure |

Locale schemas derive from Domain locales; catalogue currency defaults derive from
Domain currency. Permission and account schema facades preserve the existing db
contract without copying its registry. Session infrastructure accepts an injected
identity resolver and does not implement account eligibility or permission rules.
